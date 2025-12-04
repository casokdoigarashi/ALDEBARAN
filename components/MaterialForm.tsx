
import React, { useState, useCallback } from 'react';
import { Material } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Textarea from './common/Textarea';
import Select from './common/Select';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';

interface MaterialFormProps {
  onSave: (material: Material) => void;
  onCancel: () => void;
}

type InputTab = 'manual' | 'text' | 'file' | 'url';

const MaterialForm: React.FC<MaterialFormProps> = ({ onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<InputTab>('manual');
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');
  
  // Input contents for AI
  const [rawText, setRawText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Material, 'id'>>({
      tradeName: '',
      inciName: '',
      manufacturer: '',
      description: '',
      benefits: [],
      category: '',
      recommendedConcentration: '',
      costLevel: 'Medium',
      price: '',
      origin: '',
      country: '',
      sustainability: '',
      isOrganic: false,
      organicCertifications: []
  });
  
  const [benefitsString, setBenefitsString] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);

  const organicCertificationOptions = [
    'COSMOS',
    'ECOCERT',
    'USDA Organic',
    'JAS (Japan Agricultural Standards)',
    'EU Organic',
    'Natrue',
    'Demeter',
    'IFOAM',
    'Soil Association',
    'ACO (Australian Certified Organic)'
  ];

  const handleChange = (field: keyof Omit<Material, 'id' | 'benefits'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBenefitsChange = (value: string) => {
      setBenefitsString(value);
      setFormData(prev => ({ ...prev, benefits: value.split(',').map(s => s.trim()).filter(s => s) }));
  };

  const handleCertificationToggle = (cert: string) => {
    setSelectedCertifications(prev => {
      const updated = prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert];
      setFormData(prev => ({ ...prev, organicCertifications: updated }));
      return updated;
    });
  };

  const handleOrganicToggle = () => {
    setFormData(prev => ({ ...prev, isOrganic: !prev.isOrganic }));
  };

  const handleAnalyze = async () => {
    // Validation
    if (activeTab === 'text' && !rawText.trim()) {
        alert('テキストを入力してください');
        return;
    }
    if (activeTab === 'file' && !file) {
        alert('PDFファイルを選択してください');
        return;
    }
    if (activeTab === 'url' && !url.trim()) {
        alert('URLを入力してください');
        return;
    }

    setIsParsing(true);
    setParsingStatus('情報を取得中...');
    
    try {
        const { parseMaterialData } = await import('../services/apiService');
        let parsedData = null;

        setParsingStatus('AIが情報を分析中...');

        if (activeTab === 'text' && rawText.trim()) {
            parsedData = await parseMaterialData(rawText, 'text');
        } else if (activeTab === 'file' && file) {
            parsedData = await parseMaterialData(file, 'file');
        } else if (activeTab === 'url' && url.trim()) {
            setParsingStatus('Webページから情報を抽出中...');
            parsedData = await parseMaterialData(url, 'url');
        }

        if (parsedData) {
            setParsingStatus('フォームに入力中...');
            setFormData(prev => ({ ...prev, ...parsedData }));
            setBenefitsString(parsedData.benefits ? parsedData.benefits.join(', ') : '');
            setSelectedCertifications(parsedData.organicCertifications || []);
            
            // Switch to manual view to edit/confirm results
            setTimeout(() => {
                setActiveTab('manual');
                setParsingStatus('');
                alert('情報の抽出が完了しました！');
            }, 500);
        } else {
            setParsingStatus('');
            alert('情報を抽出できませんでした。入力内容を確認してください。');
        }
    } catch (error) {
        console.error("Analysis failed", error);
        const errorMessage = error instanceof Error ? error.message : '詳細はコンソールを確認してください';
        alert(`情報の抽出に失敗しました。\n${errorMessage}`);
        setParsingStatus('');
    } finally {
        setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
          id: `mat-${Date.now()}`,
          ...formData
      });
  };

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type === "application/pdf") {
        setFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <Card title="原料の登録・編集">
       <div className="mb-6 border-b border-brand-accent">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('manual')}
              className={`${activeTab === 'manual' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-secondary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-serif-jp font-medium text-sm`}
            >
              手入力 / 確認
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`${activeTab === 'text' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-secondary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-serif-jp font-medium text-sm flex items-center gap-2`}
            >
              <SparklesIcon className="w-4 h-4" /> AI入力 (テキスト)
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`${activeTab === 'file' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-secondary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-serif-jp font-medium text-sm flex items-center gap-2`}
            >
               <SparklesIcon className="w-4 h-4" /> AI入力 (PDF資料)
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`${activeTab === 'url' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-secondary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-serif-jp font-medium text-sm flex items-center gap-2`}
            >
               <SparklesIcon className="w-4 h-4" /> AI入力 (URL)
            </button>
          </nav>
        </div>

        {/* AI Input Sections */}
        {activeTab !== 'manual' && (
            <div className="mb-8 p-6 bg-brand-bg rounded-sm">
                {activeTab === 'text' && (
                    <Textarea 
                        label="原料資料のテキスト、メール本文などを貼り付けてください"
                        placeholder="例：成分名、特徴、推奨濃度などが含まれるテキスト..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                )}
                {activeTab === 'file' && (
                    <div 
                        className={`border-2 border-dashed rounded-sm p-8 text-center bg-white ${isDragging ? 'border-brand-primary bg-brand-bg' : 'border-gray-300'}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => {e.preventDefault(); setIsDragging(true)}}
                        onDragLeave={(e) => {e.preventDefault(); setIsDragging(false)}}
                    >
                        <input type="file" id="mat-file" className="hidden" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                        <label htmlFor="mat-file" className="cursor-pointer flex flex-col items-center">
                            <DocumentTextIcon className="w-10 h-10 text-gray-400 mb-2"/>
                            <p className="text-sm text-brand-light"><span className="font-semibold text-brand-primary">クリックしてPDFをアップロード</span></p>
                            {file && <p className="mt-2 text-sm font-serif-jp font-medium text-brand-secondary bg-green-100 px-3 py-1 rounded-full">{file.name}</p>}
                        </label>
                    </div>
                )}
                {activeTab === 'url' && (
                    <div>
                        <Input 
                            label="原料メーカーのWebページURL"
                            placeholder="https://manufacturer.com/ingredient-detail"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                )}
                
                {/* Loading Status */}
                {isParsing && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin">
                                <SparklesIcon className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <p className="font-serif-jp font-medium text-brand-primary">{parsingStatus || '処理中...'}</p>
                                <p className="text-sm text-gray-600">少々お待ちください</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-4 flex justify-end">
                    <Button type="button" onClick={handleAnalyze} disabled={isParsing} className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        {isParsing ? '解析中...' : '情報を抽出して入力'}
                    </Button>
                </div>
            </div>
        )}

        {/* Manual Form / Result View */}
        <form onSubmit={handleSubmit} className={activeTab !== 'manual' ? 'opacity-50 pointer-events-none' : ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="商品名 (Trade Name)" id="tradeName" value={formData.tradeName} onChange={(e) => handleChange('tradeName', e.target.value)} required />
                <Input label="表示名称 (INCI Name)" id="inciName" value={formData.inciName} onChange={(e) => handleChange('inciName', e.target.value)} required />
                <Input label="メーカー名" id="manufacturer" value={formData.manufacturer} onChange={(e) => handleChange('manufacturer', e.target.value)} />
                <Select label="カテゴリ" id="category" options={["保湿剤", "エモリエント", "界面活性剤", "有効成分", "防腐剤", "増粘剤", "香料", "その他"]} value={formData.category} onChange={(e) => handleChange('category', e.target.value)} />
                
                <div className="md:col-span-1">
                    <Input label="原産国" id="country" value={formData.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="例: 日本" />
                </div>
                <div className="md:col-span-1">
                    <Input label="産地" id="origin" value={formData.origin} onChange={(e) => handleChange('origin', e.target.value)} placeholder="例: 北海道" />
                </div>
                
                <Input label="価格 (Price)" id="price" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="例: 10,000円/kg" />
                <Select label="コスト感" id="costLevel" options={["High", "Medium", "Low"]} value={formData.costLevel} onChange={(e) => handleChange('costLevel', e.target.value)} />
                
                <div className="col-span-full">
                     <Input label="推奨濃度" id="recommendedConcentration" value={formData.recommendedConcentration} onChange={(e) => handleChange('recommendedConcentration', e.target.value)} placeholder="例: 1% - 5%" />
                </div>

                <div className="col-span-full">
                     <Textarea label="特徴・説明" id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                </div>
                <div className="col-span-full">
                    <Input label="効果・効能タグ (カンマ区切り)" id="benefits" value={benefitsString} onChange={(e) => handleBenefitsChange(e.target.value)} placeholder="例: 保湿, 抗炎症, 美白" />
                </div>
                 <div className="col-span-full">
                     <Input label="サステナビリティ情報" id="sustainability" value={formData.sustainability} onChange={(e) => handleChange('sustainability', e.target.value)} placeholder="例: COSMOS認証取得, パームフリー" />
                </div>

                {/* Organic Certification Section */}
                <div className="col-span-full">
                    <div className="bg-brand-bg p-4 rounded-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <input 
                                type="checkbox" 
                                id="isOrganic" 
                                checked={formData.isOrganic || false}
                                onChange={handleOrganicToggle}
                                className="w-4 h-4 text-brand-primary rounded border-gray-300 cursor-pointer"
                            />
                            <label htmlFor="isOrganic" className="font-serif-jp font-medium text-brand-primary cursor-pointer">
                                オーガニック原料
                            </label>
                        </div>
                        
                        {formData.isOrganic && (
                            <div>
                                <p className="font-serif-jp font-medium text-sm text-gray-700 mb-3">認証機関 (複数選択可)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {organicCertificationOptions.map((cert) => (
                                        <label key={cert} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCertifications.includes(cert)}
                                                onChange={() => handleCertificationToggle(cert)}
                                                className="w-4 h-4 text-brand-primary rounded border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 font-serif-jp">{cert}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-accent flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
                <Button type="submit">保存する</Button>
            </div>
        </form>
    </Card>
  );
};

export default MaterialForm;
