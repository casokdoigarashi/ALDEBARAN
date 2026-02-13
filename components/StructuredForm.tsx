
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

const StructuredForm: React.FC<StructuredFormProps> = ({ onSubmit, onBack, initialData }) => {
  const [formData, setFormData] = useState<InquiryData>(createInitialState(initialData));
  const [activeTab, setActiveTab] = useState<InputTab>('text');
  
  // Client Research State
  const [researchCompany, setResearchCompany] = useState('');
  const [researchUrl, setResearchUrl] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ClientResearch | null>(initialData?.clientResearch || null);

  // Text Input State
  const [rawText, setRawText] = useState('');
  
  // File Input State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // URL Input State
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
        // Keep existing research result if exists
        setFormData(prev => ({
            ...parsedData!,
            clientResearch: researchResult || prev.clientResearch
        }));
      }
    } catch (error) {
      console.error("Failed to parse input:", error);
      // In a real app, show an error toast
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

  // Drag and Drop handlers
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

  return (
    <form onSubmit={handleSubmit}>
      <Card title="新規提案を作成">

        {/* Client Research Section */}
        <div className="mb-8 border border-brand-accent rounded-sm bg-brand-bg overflow-hidden shadow-sm">
             <div className="bg-brand-light border-b border-brand-accent px-4 py-3">
                 <h3 className="text-lg font-semibold text-brand-secondary flex items-center">
                     <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                     顧客企業リサーチ (Google検索連携)
                 </h3>
             </div>
             <div className="p-6">
                 <p className="text-sm text-brand-secondary mb-4">
                     クライアントの会社名やURLを入力すると、最新のニュースやSNS、ブランド動向をリサーチし、提案内容に反映させます。
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                         <label className="block text-sm font-serif-jp font-serif-jp font-medium text-brand-secondary mb-1">会社名 / ブランド名</label>
                         <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-brand-accent rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            placeholder="例: 株式会社アルデバラン"
                            value={researchCompany}
                            onChange={(e) => setResearchCompany(e.target.value)}
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-serif-jp font-serif-jp font-medium text-brand-secondary mb-1">WebサイトURL (任意)</label>
                         <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-brand-accent rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            placeholder="https://example.com"
                            value={researchUrl}
                            onChange={(e) => setResearchUrl(e.target.value)}
                         />
                     </div>
                 </div>
                 
                 {!researchResult ? (
                     <div className="flex justify-end">
                         <Button type="button" variant="secondary" onClick={handleResearch} disabled={isResearching || !researchCompany} className="bg-brand-primary hover:bg-yellow-700 text-white border-none">
                             {isResearching ? 'リサーチ中...' : 'AIリサーチ実行'}
                         </Button>
                     </div>
                 ) : (
                     <div className="bg-white rounded-sm p-4 border border-brand-accent animate-fadeIn">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-brand-secondary">リサーチ結果</h4>
                             <button type="button" onClick={() => setResearchResult(null)} className="text-xs text-brand-bg0 underline">リセット</button>
                         </div>
                         <div className="prose prose-sm max-w-none text-brand-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                             {researchResult.summary}
                         </div>
                         {researchResult.extractedUrls && researchResult.extractedUrls.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-brand-bg0 font-semibold">参照元:</p>
                                <ul className="list-disc pl-4 text-xs text-brand-primary truncate">
                                    {researchResult.extractedUrls.slice(0, 3).map((u, i) => (
                                        <li key={i}><a href={u} target="_blank" rel="noopener noreferrer" className="hover:underline">{u}</a></li>
                                    ))}
                                </ul>
                            </div>
                         )}
                     </div>
                 )}
             </div>
        </div>

        <div className="mb-8 border border-brand-light rounded-sm bg-white overflow-hidden shadow-sm">
          <div className="bg-brand-bg border-b border-brand-accent px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-brand-secondary flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" />
              案件情報 AI自動入力
            </h3>
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab('text')}
                    className={`px-3 py-1.5 text-sm font-serif-jp font-serif-jp font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'text' ? 'bg-white text-brand-primary shadow' : 'text-brand-light hover:text-gray-800'}`}
                >
                    <span>テキスト</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('file')}
                    className={`px-3 py-1.5 text-sm font-serif-jp font-serif-jp font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'file' ? 'bg-white text-brand-primary shadow' : 'text-brand-light hover:text-gray-800'}`}
                >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>ファイル(PDF)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('url')}
                    className={`px-3 py-1.5 text-sm font-serif-jp font-serif-jp font-medium rounded-sm transition-colors flex items-center gap-2 ${activeTab === 'url' ? 'bg-white text-brand-primary shadow' : 'text-brand-light hover:text-gray-800'}`}
                >
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>URL</span>
                </button>
            </div>
          </div>
          
          <div className="p-6 bg-brand-bg/30">
            {activeTab === 'text' && (
                <div>
                    <p className="text-sm text-brand-light mb-3">メール本文や議事録などを貼り付けてください。</p>
                    <Textarea
                        id="raw-text-input"
                        label=""
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="例：
20代後半〜30代向けのエイジングケア美容液を作りたいです。
主成分はバクチオールで、敏感肌でも使える処方を希望します。
パッケージは環境に配慮したもので、予算は..."
                        disabled={isParsing}
                        className="bg-white"
                    />
                </div>
            )}

            {activeTab === 'file' && (
                <div>
                    <p className="text-sm text-brand-light mb-3">企画書や参考資料のPDFをアップロードしてください。</p>
                    <div 
                        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors duration-200 bg-white ${isDragging ? 'border-brand-primary bg-brand-bg' : 'border-gray-300'}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            type="file"
                            id="file-upload-tab"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload-tab" className="cursor-pointer flex flex-col items-center">
                            <DocumentTextIcon className="w-10 h-10 text-gray-400 mb-2"/>
                            <p className="text-sm text-brand-light">
                                <span className="font-semibold text-brand-primary">クリックしてアップロード</span> またはドラッグ＆ドロップ
                            </p>
                            {file ? (
                                <p className="mt-2 text-sm font-serif-jp font-serif-jp font-medium text-brand-secondary bg-green-100 px-3 py-1 rounded-full">{file.name}</p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-400">PDFファイル (最大 10MB)</p>
                            )}
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'url' && (
                <div>
                    <p className="text-sm text-brand-light mb-3">参考製品や競合製品のWebページURLを入力してください。</p>
                    <div className="relative rounded-sm shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-sm border-gray-300 pl-10 focus:border-brand-primary focus:ring-brand-primary sm:text-sm py-3 border"
                            placeholder="https://example.com/product"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isParsing}
                        />
                    </div>
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <Button type="button" onClick={handleAnalyze} disabled={isAnalyzeDisabled()} className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    {isParsing ? 'AIが解析中...' : '解析して入力'}
                </Button>
            </div>
          </div>
        </div>
        
        {/* 製品情報セクション */}
        <div className="mb-6 p-6 bg-brand-light border-2 border-brand-accent rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-brand-primary flex items-center gap-2">
            📦 製品情報
          </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Column 1 */}
          <div>
            <Select 
              id="product_type"
              label={FORM_LABELS.product_type}
              options={PRODUCT_TYPES}
              value={formData.product_type.value}
              onChange={(e) => handleChange('product_type', e.target.value)}
              confidence={formData.product_type.confidence}
              required
            />
            <TagInput
              label={FORM_LABELS.purpose_goals}
              options={PURPOSE_GOALS}
              selectedOptions={formData.purpose_goals.value}
              onChange={(v) => handleChange('purpose_goals', v)}
              confidence={formData.purpose_goals.confidence}
            />
             <Input
              id="target_audience"
              label={FORM_LABELS.target_audience}
              value={formData.target_audience.value}
              onChange={(e) => handleChange('target_audience', e.target.value)}
              confidence={formData.target_audience.confidence}
              placeholder="例：20代〜30代女性、敏感肌"
            />
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
            <TagInput
              label={FORM_LABELS.certifications}
              options={CERTIFICATIONS}
              selectedOptions={formData.certifications.value}
              onChange={(v) => handleChange('certifications', v)}
              confidence={formData.certifications.confidence}
            />
            <Input
              id="allergens_restrictions"
              label={FORM_LABELS.allergens_restrictions}
              value={formData.allergens_restrictions.value}
              onChange={(e) => handleChange('allergens_restrictions', e.target.value)}
              confidence={formData.allergens_restrictions.confidence}
              placeholder="例：グルテンフリー、ナッツ不使用"
            />
             <Input
              id="brand_story_tone"
              label={FORM_LABELS.brand_story_tone}
              value={formData.brand_story_tone.value}
              onChange={(e) => handleChange('brand_story_tone', e.target.value)}
              confidence={formData.brand_story_tone.confidence}
              placeholder="例：ミニマル、クリニカル、ボタニカル"
            />
          </div>

          {/* Column 2 */}
          <div>
            <Input
              id="sensory"
              label={FORM_LABELS.sensory}
              value={formData.sensory.value}
              onChange={(e) => handleChange('sensory', e.target.value)}
              confidence={formData.sensory.confidence}
              placeholder="例：軽いテクスチャ、柑橘系の香り、無着色"
            />
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
        </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-brand-accent flex justify-between items-center">
           <Button type="button" variant="outline" onClick={onBack}>
            トップに戻る
          </Button>
          <Button type="submit">
            最適な提案を検索
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default StructuredForm;
