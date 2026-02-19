
import React, { useState, useCallback } from 'react';
import { InquiryData, FormFieldData, ClientResearch } from '../types';
import { FORM_LABELS, PRODUCT_TYPES, PURPOSE_GOALS, CERTIFICATIONS } from '../constants';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import TagInput from './common/TagInput';
import Textarea from './common/Textarea';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

interface StructuredFormProps {
  onSubmit: (data: InquiryData) => void;
  onBack: () => void;
  initialData?: InquiryData;
}

type InputTab = 'text' | 'file' | 'url';

const createInitialState = (initialData?: InquiryData): InquiryData => {
  if (initialData) return initialData;
  const emptyField = <T,>(defaultValue: T): FormFieldData<T> => ({ value: defaultValue });
  return {
    source: 'form',
    product_type: emptyField(''),
    purpose_goals: emptyField([]),
    target_audience: emptyField(''),
    hero_ingredients_preference: emptyField(''),
    claims_must: emptyField(''),
    certifications: emptyField([]),
    allergens_restrictions: emptyField(''),
    sensory: emptyField(''),
    markets: emptyField(''),
    lot_size: emptyField(''),
    budget_band: emptyField(''),
    lead_time_expectation: emptyField(''),
    package_preferences: emptyField(''),
    sustainability: emptyField(''),
    brand_story_tone: emptyField(''),
    references: emptyField(''),
    contact_info_internal: emptyField(''),
  };
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-brand-accent/40">
    <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-brand-secondary">{title}</h3>
      {subtitle && <p className="text-xs text-brand-light mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const StructuredForm: React.FC<StructuredFormProps> = ({ onSubmit, onBack, initialData }) => {
  const [formData, setFormData] = useState<InquiryData>(createInitialState(initialData));
  const [activeTab, setActiveTab] = useState<InputTab>('text');

  const [researchCompany, setResearchCompany] = useState('');
  const [researchUrl, setResearchUrl] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ClientResearch | null>(initialData?.clientResearch || null);

  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleChange = <K extends Exclude<keyof InquiryData, 'source' | 'clientResearch'>>(field: K, value: InquiryData[K]['value']) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], value },
    }));
  };

  const handleAnalyze = async () => {
    setIsParsing(true);
    try {
      const { parseInquiryText, ingestFileOrUrl } = await import('../services/apiService');
      let parsedData: InquiryData | null = null;

      if (activeTab === 'text' && rawText.trim()) {
        parsedData = await parseInquiryText(rawText);
      } else if (activeTab === 'file' && file) {
        parsedData = await ingestFileOrUrl(file);
      } else if (activeTab === 'url' && url.trim()) {
        parsedData = await ingestFileOrUrl(url);
      }

      if (parsedData) {
        setFormData(prev => ({
            ...parsedData!,
            clientResearch: researchResult || prev.clientResearch
        }));
      }
    } catch (error) {
      console.error("Failed to parse input:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleResearch = async () => {
    if (!researchCompany.trim()) return;
    setIsResearching(true);
    try {
        const { performClientResearch } = await import('../services/apiService');
        const result = await performClientResearch(researchCompany, researchUrl);
        setResearchResult(result);
        setFormData(prev => ({ ...prev, clientResearch: result }));
    } catch (error) {
        console.error("Research failed:", error);
        alert("企業リサーチに失敗しました。");
    } finally {
        setIsResearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (e.dataTransfer.files[0].type === "application/pdf") {
            setFile(e.dataTransfer.files[0]);
        }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const isAnalyzeDisabled = () => {
      if (isParsing) return true;
      if (activeTab === 'text') return !rawText.trim();
      if (activeTab === 'file') return !file;
      if (activeTab === 'url') return !url.trim();
      return true;
  };

  const tabItems = [
    { key: 'text' as InputTab, label: 'テキスト', icon: null },
    { key: 'file' as InputTab, label: 'ファイル(PDF)', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { key: 'url' as InputTab, label: 'URL', icon: <GlobeAltIcon className="w-4 h-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-secondary mb-2">新規提案を作成</h1>
        <p className="text-sm text-brand-light">AIがクライアントの要件を分析し、最適な製品提案を生成します。</p>
      </div>

      <div className="space-y-6">
        {/* ===== Section 1: Client Research ===== */}
        <Card padding="md">
          <SectionHeader
            icon={<BuildingOfficeIcon className="w-5 h-5 text-brand-primary" />}
            title="顧客企業リサーチ"
            subtitle="Google検索連携で企業情報を自動リサーチ"
          />
          <p className="text-sm text-brand-light mb-4">
            クライアントの会社名やURLを入力すると、最新のニュースやSNS、ブランド動向をリサーチし、提案内容に反映させます。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1.5">会社名 / ブランド名</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                placeholder="例: 株式会社アルデバラン"
                value={researchCompany}
                onChange={(e) => setResearchCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1.5">WebサイトURL <span className="text-brand-light font-normal">(任意)</span></label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                placeholder="https://example.com"
                value={researchUrl}
                onChange={(e) => setResearchUrl(e.target.value)}
              />
            </div>
          </div>

          {!researchResult ? (
            <div className="flex justify-end">
              <Button type="button" onClick={handleResearch} disabled={isResearching || !researchCompany} size="sm">
                <SparklesIcon className="w-4 h-4 mr-1.5" />
                {isResearching ? 'リサーチ中...' : 'AIリサーチ実行'}
              </Button>
            </div>
          ) : (
            <div className="bg-brand-muted rounded-xl p-4 border border-brand-accent/40 animate-slide-up">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h4 className="font-semibold text-sm text-brand-secondary">リサーチ完了</h4>
                </div>
                <button type="button" onClick={() => setResearchResult(null)} className="text-xs text-brand-light hover:text-red-500 transition-colors">リセット</button>
              </div>
              <div className="text-sm text-brand-secondary whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                {researchResult.summary}
              </div>
              {researchResult.extractedUrls && researchResult.extractedUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-accent/40">
                  <p className="text-xs text-brand-light font-medium mb-1">参照元:</p>
                  <ul className="space-y-0.5">
                    {researchResult.extractedUrls.slice(0, 3).map((u, i) => (
                      <li key={i} className="text-xs"><a href={u} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline truncate block">{u}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ===== Section 2: AI Auto-fill ===== */}
        <Card padding="md">
          <SectionHeader
            icon={<SparklesIcon className="w-5 h-5 text-brand-primary" />}
            title="案件情報 AI自動入力"
            subtitle="テキスト・ファイル・URLからAIが自動で要件を抽出"
          />

          {/* Tabs */}
          <div className="flex bg-brand-muted rounded-xl p-1 mb-4">
            {tabItems.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-white text-brand-primary shadow-soft'
                    : 'text-brand-light hover:text-brand-secondary'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="bg-brand-muted/30 rounded-xl p-5 border border-brand-accent/30">
            {activeTab === 'text' && (
              <div>
                <p className="text-sm text-brand-light mb-3">メール本文や議事録などを貼り付けてください。</p>
                <Textarea
                  id="raw-text-input"
                  label=""
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="例：&#10;20代後半〜30代向けのエイジングケア美容液を作りたいです。&#10;主成分はバクチオールで、敏感肌でも使える処方を希望します。&#10;パッケージは環境に配慮したもので、予算は..."
                  disabled={isParsing}
                  className="bg-white"
                />
              </div>
            )}

            {activeTab === 'file' && (
              <div>
                <p className="text-sm text-brand-light mb-3">企画書や参考資料のPDFをアップロードしてください。</p>
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 bg-white ${
                    isDragging ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <input type="file" id="file-upload-tab" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  <label htmlFor="file-upload-tab" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-brand-muted flex items-center justify-center mb-3">
                      <DocumentTextIcon className="w-6 h-6 text-brand-light" />
                    </div>
                    <p className="text-sm text-brand-light">
                      <span className="font-medium text-brand-primary">クリックしてアップロード</span> またはドラッグ&ドロップ
                    </p>
                    {file ? (
                      <p className="mt-3 text-sm font-medium text-brand-secondary bg-green-50 px-4 py-1.5 rounded-full border border-green-200">{file.name}</p>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400">PDFファイル (最大 10MB)</p>
                    )}
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <div>
                <p className="text-sm text-brand-light mb-3">参考製品や競合製品のWebページURLを入力してください。</p>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                    placeholder="https://example.com/product"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isParsing}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={handleAnalyze} disabled={isAnalyzeDisabled()} className="w-full sm:w-auto">
                <SparklesIcon className="w-4 h-4 mr-1.5" />
                {isParsing ? 'AIが解析中...' : '解析して入力'}
              </Button>
            </div>
          </div>
        </Card>

        {/* ===== Section 3: Product Details ===== */}
        <Card padding="md">
          <SectionHeader
            icon={<svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
            title="製品の基本情報"
            subtitle="製品タイプ、ターゲット、成分、認証など"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <Select
              id="product_type"
              label={FORM_LABELS.product_type}
              options={PRODUCT_TYPES}
              value={formData.product_type.value}
              onChange={(e) => handleChange('product_type', e.target.value)}
              confidence={formData.product_type.confidence}
              required
            />
            <Input
              id="target_audience"
              label={FORM_LABELS.target_audience}
              value={formData.target_audience.value}
              onChange={(e) => handleChange('target_audience', e.target.value)}
              confidence={formData.target_audience.confidence}
              placeholder="例：20代〜30代女性、敏感肌"
            />
            <div className="md:col-span-2">
              <TagInput
                label={FORM_LABELS.purpose_goals}
                options={PURPOSE_GOALS}
                selectedOptions={formData.purpose_goals.value}
                onChange={(v) => handleChange('purpose_goals', v)}
                confidence={formData.purpose_goals.confidence}
              />
            </div>
            <Input
              id="hero_ingredients_preference"
              label={FORM_LABELS.hero_ingredients_preference}
              value={formData.hero_ingredients_preference.value}
              onChange={(e) => handleChange('hero_ingredients_preference', e.target.value)}
              confidence={formData.hero_ingredients_preference.confidence}
              placeholder="例：ビタミンCを使用、レチノールは避ける"
            />
            <Input
              id="claims_must"
              label={FORM_LABELS.claims_must}
              value={formData.claims_must.value}
              onChange={(e) => handleChange('claims_must', e.target.value)}
              confidence={formData.claims_must.confidence}
              placeholder="例：95%オーガニック、ヴィーガンフレンドリー"
            />
            <div className="md:col-span-2">
              <TagInput
                label={FORM_LABELS.certifications}
                options={CERTIFICATIONS}
                selectedOptions={formData.certifications.value}
                onChange={(v) => handleChange('certifications', v)}
                confidence={formData.certifications.confidence}
              />
            </div>
            <Input
              id="allergens_restrictions"
              label={FORM_LABELS.allergens_restrictions}
              value={formData.allergens_restrictions.value}
              onChange={(e) => handleChange('allergens_restrictions', e.target.value)}
              confidence={formData.allergens_restrictions.confidence}
              placeholder="例：グルテンフリー、ナッツ不使用"
            />
            <Input
              id="sensory"
              label={FORM_LABELS.sensory}
              value={formData.sensory.value}
              onChange={(e) => handleChange('sensory', e.target.value)}
              confidence={formData.sensory.confidence}
              placeholder="例：軽いテクスチャ、柑橘系の香り、無着色"
            />
          </div>
        </Card>

        {/* ===== Section 4: Business Details ===== */}
        <Card padding="md">
          <SectionHeader
            icon={<svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
            title="ビジネス要件"
            subtitle="予算、ロット、納期、パッケージ、対象市場"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <Input
              id="markets"
              label={FORM_LABELS.markets}
              value={formData.markets.value}
              onChange={(e) => handleChange('markets', e.target.value)}
              confidence={formData.markets.confidence}
              placeholder="例：日本、EU、アメリカ"
            />
            <Input
              id="lot_size"
              label={FORM_LABELS.lot_size}
              value={formData.lot_size.value}
              onChange={(e) => handleChange('lot_size', e.target.value)}
              confidence={formData.lot_size.confidence}
              placeholder="例：年間3000個"
            />
            <Input
              id="budget_band"
              label={FORM_LABELS.budget_band}
              value={formData.budget_band.value}
              onChange={(e) => handleChange('budget_band', e.target.value)}
              confidence={formData.budget_band.confidence}
              placeholder="例：500円〜700円 FOB"
            />
            <Input
              id="lead_time_expectation"
              label={FORM_LABELS.lead_time_expectation}
              value={formData.lead_time_expectation.value}
              onChange={(e) => handleChange('lead_time_expectation', e.target.value)}
              confidence={formData.lead_time_expectation.confidence}
              placeholder="例：2024年10月までに初回納品"
            />
            <Input
              id="package_preferences"
              label={FORM_LABELS.package_preferences}
              value={formData.package_preferences.value}
              onChange={(e) => handleChange('package_preferences', e.target.value)}
              confidence={formData.package_preferences.confidence}
              placeholder="例：50ml ガラス製ポンプボトル、シルクスクリーン印刷"
            />
            <Input
              id="sustainability"
              label={FORM_LABELS.sustainability}
              value={formData.sustainability.value}
              onChange={(e) => handleChange('sustainability', e.target.value)}
              confidence={formData.sustainability.confidence}
              placeholder="例：リサイクルPET、FSC認証紙"
            />
          </div>
        </Card>

        {/* ===== Section 5: Brand & Contact ===== */}
        <Card padding="md">
          <SectionHeader
            icon={<svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
            title="ブランド・担当者情報"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <Input
              id="brand_story_tone"
              label={FORM_LABELS.brand_story_tone}
              value={formData.brand_story_tone.value}
              onChange={(e) => handleChange('brand_story_tone', e.target.value)}
              confidence={formData.brand_story_tone.confidence}
              placeholder="例：ミニマル、クリニカル、ボタニカル"
            />
            <Input
              id="contact_info_internal"
              label={FORM_LABELS.contact_info_internal}
              value={formData.contact_info_internal.value}
              onChange={(e) => handleChange('contact_info_internal', e.target.value)}
              confidence={formData.contact_info_internal.confidence}
              placeholder="担当者名と顧客名"
              required
            />
          </div>
        </Card>

        {/* ===== Actions ===== */}
        <div className="flex justify-between items-center pt-2 pb-4">
          <Button type="button" variant="ghost" onClick={onBack} size="lg">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            トップに戻る
          </Button>
          <Button type="submit" size="lg">
            <SparklesIcon className="w-4 h-4 mr-1.5" />
            最適な提案を検索
          </Button>
        </div>
      </div>
    </form>
  );
};

export default StructuredForm;
