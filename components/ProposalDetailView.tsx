
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FullProposal, ProposalContent } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { DocumentDownloadIcon } from './icons/DocumentDownloadIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

interface ProposalDetailViewProps {
  proposal: FullProposal;
  onBack: () => void;
}

const ProposalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-xl font-bold text-brand-secondary border-b-2 border-brand-light pb-2 mb-4">{title}</h3>
    <div className="text-gray-700 prose max-w-none">{children}</div>
  </div>
);

const ProposalContentDisplay: React.FC<{ content: ProposalContent, id: string }> = ({ content, id }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [emailTone, setEmailTone] = useState<'standard' | 'formal' | 'casual'>('standard');

  const getEmailContent = () => {
    if (content.emailDrafts) {
      return content.emailDrafts[emailTone] || content.emailDrafts.standard;
    }
    // Fallback for old data or if drafts missing
    return content.emailDraft || '';
  };

  const currentEmailContent = getEmailContent();

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(currentEmailContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [currentEmailContent]);

  return (
    <div id={id}>
      {/* Executive Summary Section */}
      {content.executiveSummary && (
        <div className="mb-8 p-6 bg-green-50 rounded-lg border border-brand-light shadow-sm">
            <h3 className="text-lg font-bold text-brand-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">✨</span> エグゼクティブ・サマリー
            </h3>
            <p className="text-gray-800 text-lg leading-relaxed font-medium">
                {content.executiveSummary}
            </p>
        </div>
      )}

      {/* Client Research Section (Added) */}
      {content.clientResearch && (
        <div className="mb-10 border border-blue-200 rounded-lg bg-blue-50 overflow-hidden shadow-sm no-print">
            <div className="bg-blue-100/50 border-b border-blue-200 px-4 py-3">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    クライアント動向サマリー (背景情報)
                </h3>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-bold text-blue-900 text-lg">{content.clientResearch.companyName}</h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">AIリサーチ結果</span>
                </div>
                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {content.clientResearch.summary}
                </div>
                {content.clientResearch.extractedUrls && content.clientResearch.extractedUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-xs text-gray-500 font-semibold mb-1">参照ソース:</p>
                    <ul className="list-disc pl-4 text-xs text-blue-600 truncate space-y-1">
                        {content.clientResearch.extractedUrls.slice(0, 3).map((u, i) => (
                            <li key={i}><a href={u} target="_blank" rel="noopener noreferrer" className="hover:underline">{u}</a></li>
                        ))}
                    </ul>
                </div>
                )}
            </div>
        </div>
      )}

      <ProposalSection title="製品名案 & タグライン">
        <ul className="list-disc pl-5">
          {content.productNameSuggestions.map(name => <li key={name} className="text-lg font-semibold">{name}</li>)}
        </ul>
        <p className="mt-4 text-xl font-serif text-brand-secondary italic text-center border-t border-b border-gray-100 py-4">
            "{content.tagline}"
        </p>
      </ProposalSection>

      <ProposalSection title="コンセプト概要">
        <p className="leading-relaxed">{content.conceptSummary}</p>
      </ProposalSection>

      <ProposalSection title="主要成分">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-2">INCI名</th>
              <th className="px-2">一般名</th>
              <th className="px-2">配合範囲</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {content.mainIngredients.map((ing, i) => (
              <tr key={i} className={`border-b border-gray-200 ${ing.isInternalMaterial ? 'bg-green-50' : ''}`}>
                <td className="py-2 px-2 font-medium">
                    {ing.inci}
                    {ing.isInternalMaterial && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-primary text-white">自社原料</span>}
                </td>
                <td className="px-2">{ing.commonName}</td>
                <td className="px-2">{ing.percentageRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ProposalSection>

      <ProposalSection title="パッケージ提案">
          <div className="grid gap-4">
            {content.packageProposals.map((pkg, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-md border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2">{pkg.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p><span className="font-semibold text-gray-600">仕様:</span> {pkg.capacity} {pkg.material}</p>
                        <p><span className="font-semibold text-gray-600">装飾:</span> {pkg.decoration}</p>
                        <p><span className="font-semibold text-gray-600">MOQ:</span> {pkg.moq}</p>
                        <p><span className="font-semibold text-gray-600">納期:</span> {pkg.leadTime}</p>
                        <p><span className="font-semibold text-gray-600">概算コスト:</span> {pkg.costRange}</p>
                    </div>
                </div>
            ))}
          </div>
      </ProposalSection>
      
      <ProposalSection title="製造 & コスト見積">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <span className="block text-sm font-semibold text-gray-500">想定ロットサイズ</span>
                    <span className="text-lg">{content.manufacturingEstimate.lotSize}</span>
                </div>
                <div>
                    <span className="block text-sm font-semibold text-gray-500">標準納期</span>
                    <span className="text-lg">{content.manufacturingEstimate.leadTime}</span>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
                <span className="block text-sm font-semibold text-gray-500">概算トータルコスト</span>
                <span className="text-2xl font-bold text-brand-secondary">{content.costRange.total}</span>
                <p className="text-xs text-gray-500 mt-1">※処方、容器、加工費を含む概算です。</p>
            </div>
          </div>
      </ProposalSection>

      <ProposalSection title="薬事関連情報">
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border-l-4 border-yellow-400">{content.regulatoryNotes}</p>
      </ProposalSection>

      <ProposalSection title="次のステップ">
        <ul className="list-decimal pl-5 space-y-2">
          {content.nextActions.map(action => <li key={action}>{action}</li>)}
        </ul>
      </ProposalSection>
      
      {/* Email Draft Section with Tone Selection */}
      <div className="mb-8 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-brand-light pb-2 mb-4 gap-4">
          <h3 className="text-xl font-bold text-brand-secondary">メール下書き</h3>
          <div className="flex items-center gap-2">
             <div className="flex bg-gray-100 p-1 rounded-md">
                 <button 
                    onClick={() => setEmailTone('standard')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${emailTone === 'standard' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    標準
                 </button>
                 <button 
                    onClick={() => setEmailTone('formal')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${emailTone === 'formal' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    フォーマル
                 </button>
                 <button 
                    onClick={() => setEmailTone('casual')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${emailTone === 'casual' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    親しみやすく
                 </button>
             </div>
             <Button variant="outline" onClick={handleCopyEmail} className="px-3 py-1.5 text-sm flex items-center gap-2 ml-2">
                <ClipboardIcon className="w-4 h-4" />
                {isCopied ? 'コピーしました' : 'コピー'}
             </Button>
          </div>
        </div>
        <div className="text-gray-700 prose max-w-none">
          <div className="p-6 bg-blue-50/50 rounded-lg border border-blue-100 whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 shadow-inner">
              {currentEmailContent}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProposalDetailView: React.FC<ProposalDetailViewProps> = ({ proposal, onBack }) => {
  const [language, setLanguage] = useState<'jp' | 'en'>('jp');
  const [exportOpen, setExportOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = (format: 'pdf' | 'word' | 'gdocs') => {
    setExportOpen(false);
    const content = proposal[language];
    
    switch (format) {
      case 'pdf':
        window.print();
        break;
      case 'word':
        {
          const contentNode = document.getElementById('printable-area');
          if (!contentNode) return;

          const htmlContent = `
            <!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${contentNode.innerHTML}</body></html>
          `;
          const blob = new Blob([htmlContent], { type: 'application/msword' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const fileName = (content.productNameSuggestions?.[0] || `proposal-${proposal.id}`).replace(/ /g, '_');
          link.download = `${fileName}.doc`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        break;
      case 'gdocs':
        {
            let text = `エグゼクティブ・サマリー:\n${content.executiveSummary}\n\n`;
            text += `製品名案: ${content.productNameSuggestions.join(', ')}\n`;
            text += `タグライン: ${content.tagline}\n\n`;
            text += `コンセプト概要:\n${content.conceptSummary}\n\n`;
            // Add more fields as needed for a comprehensive copy
            navigator.clipboard.writeText(text).then(() => {
              setCopyStatus('コピーしました！');
              setTimeout(() => setCopyStatus(''), 2000);
            });
        }
        break;
    }
  };


  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-brand-secondary">生成された提案書</h2>
          <p className="text-gray-500">提案ID: {proposal.id}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setLanguage('jp')}
              className={`px-4 py-2 rounded-l-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition ${language === 'jp' ? 'bg-brand-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              日本語
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`-ml-px px-4 py-2 rounded-r-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition ${language === 'en' ? 'bg-brand-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              English
            </button>
          </div>
          <div className="relative" ref={exportMenuRef}>
            <Button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-2">
              エクスポート
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </Button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button onClick={() => handleExport('pdf')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    <PrinterIcon className="w-5 h-5" />
                    印刷 / PDFとして保存
                  </button>
                  <button onClick={() => handleExport('word')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    <DocumentDownloadIcon className="w-5 h-5" />
                    Word (.doc) としてダウンロード
                  </button>
                  <button onClick={() => handleExport('gdocs')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                     <ClipboardIcon className="w-5 h-5" />
                    {copyStatus || 'Google Docs用にコピー'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="printable-area" className="bg-white p-6 sm:p-8 rounded-md border shadow-sm">
        {language === 'jp' ? <ProposalContentDisplay id="proposal-content-jp" content={proposal.jp} /> : <ProposalContentDisplay id="proposal-content-en" content={proposal.en} />}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 no-print">
        <Button variant="outline" onClick={onBack}>
          マッチング結果に戻る
        </Button>
      </div>
    </Card>
  );
};

export default ProposalDetailView;
