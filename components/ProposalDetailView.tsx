import React, { useState, useEffect } from 'react';
import { FullProposal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { downloadProposalAsPdf, downloadProposalAsHtml } from '../services/pdfService';
import Button from './common/Button';

interface ProposalDetailViewProps {
  proposal: FullProposal;
  onBack: () => void;
  proposalId?: string;
  onSave?: (proposalId: string, proposal: FullProposal) => void;
}

const ProposalDetailView: React.FC<ProposalDetailViewProps> = ({
  proposal,
  onBack,
  proposalId,
  onSave
}) => {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      // Generate a unique ID if not provided
      const saveId = proposalId || `proposal-${Date.now()}`;

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: saveId,
          clientName: proposal.jp.productName || 'Untitled Proposal',
          websiteUrl: '',
          proposalContent: proposal,
          researchData: {},
          formData: {}
        })
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      const savedProposal = await response.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSave(saveId, proposal);
    } catch (error) {
      alert('提案書の保存に失敗しました');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    const filename = `${proposal.jp.productNameSuggestions?.[0] || 'proposal'}.pdf`;
    downloadProposalAsPdf(proposal, filename);
    setShowExportMenu(false);
  };

  const handleExportHtml = () => {
    const filename = `${proposal.jp.productNameSuggestions?.[0] || 'proposal'}.html`;
    downloadProposalAsHtml(proposal, filename);
    setShowExportMenu(false);
  };

  const content = proposal.jp;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </Button>
        <div className="flex gap-3">
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          )}

          {/* エクスポートメニュー */}
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              variant="secondary"
              className="gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              エクスポート
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-elevated z-10 border border-brand-accent/60 overflow-hidden animate-slide-down">
                <button
                  onClick={handleExportPdf}
                  className="w-full text-left px-4 py-3 hover:bg-brand-muted transition-colors text-sm flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF として出力
                </button>
                <button
                  onClick={handleExportHtml}
                  className="w-full text-left px-4 py-3 hover:bg-brand-muted transition-colors text-sm border-t border-brand-accent/40 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  HTML として出力
                </button>
                <button
                  onClick={() => { window.print(); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-brand-muted transition-colors text-sm border-t border-brand-accent/40 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  印刷
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3 animate-slide-down">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          提案書を保存しました
        </div>
      )}

      {/* 提案書内容 */}
      <div className="bg-white rounded-2xl shadow-card p-8 sm:p-10 space-y-10">
        {/* タイトル */}
        <div className="border-b border-brand-accent/60 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-secondary mb-3">
            {content.productNameSuggestions?.[0] || '提案書'}
          </h1>
          <p className="text-xl text-brand-primary font-medium">
            {content.tagline}
          </p>
        </div>

        {/* エグゼクティブサマリー */}
        {content.executiveSummary && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              エグゼクティブサマリー
            </h2>
            <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
              {content.executiveSummary}
            </p>
          </section>
        )}

        {/* コンセプト */}
        <section>
          <h2 className="text-2xl font-bold text-brand-secondary mb-5">
            コンセプト
          </h2>
          <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
            {content.conceptSummary}
          </p>
        </section>

        {/* 主要成分 */}
        {content.mainIngredients && content.mainIngredients.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              主要成分
            </h2>
            <div className="space-y-4">
              {content.mainIngredients.map((ingredient, idx) => (
                <div key={idx} className="p-4 bg-brand-bg rounded-xl">
                  <p className="font-semibold text-brand-secondary">
                    {ingredient.commonName}
                    {ingredient.isInternalMaterial && (
                      <span className="ml-2 text-xs bg-brand-primary text-white px-2.5 py-1 rounded-lg">
                        自社原料
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-brand-secondary mt-1">INCI: {ingredient.inci}</p>
                  <p className="text-sm text-brand-secondary">
                    配合: {ingredient.percentageRange}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 期待される機能 */}
        {content.expectedFunctions && content.expectedFunctions.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              期待される機能
            </h2>
            <ul className="space-y-3">
              {content.expectedFunctions.map((func, idx) => (
                <li key={idx} className="flex space-x-3">
                  <span className="text-brand-primary mt-0.5 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-brand-secondary">{func.func}</p>
                    <p className="text-sm text-brand-light mt-0.5">{func.evidence}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* パッケージ提案 */}
        {content.packageProposals && content.packageProposals.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              パッケージ提案
            </h2>
            <div className="space-y-4">
              {content.packageProposals.map((pkg, idx) => (
                <div key={idx} className="p-5 border border-brand-accent/60 rounded-xl bg-brand-bg/30">
                  <h3 className="font-semibold text-brand-secondary mb-3">{pkg.name}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-brand-secondary">
                    <p><strong>容量:</strong> {pkg.capacity}</p>
                    <p><strong>素材:</strong> {pkg.material}</p>
                    <p><strong>MOQ:</strong> {pkg.moq}</p>
                    <p><strong>納期:</strong> {pkg.leadTime}</p>
                    <p><strong>装飾:</strong> {pkg.decoration}</p>
                    <p><strong>コスト:</strong> {pkg.costRange}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* コスト見積 */}
        {content.costRange && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              コスト見積
            </h2>
            <div className="p-5 bg-brand-bg rounded-xl space-y-2.5 text-sm text-brand-secondary">
              <p><strong>原料:</strong> {content.costRange.materials}</p>
              <p><strong>充填:</strong> {content.costRange.filling}</p>
              <p><strong>容器:</strong> {content.costRange.container}</p>
              <p><strong>印刷:</strong> {content.costRange.printing}</p>
              <p className="border-t border-brand-accent/60 pt-3 font-semibold text-base">
                <strong>合計:</strong> {content.costRange.total}
              </p>
            </div>
          </section>
        )}

        {/* 規制上の注記 */}
        {content.regulatoryNotes && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              規制上の注記
            </h2>
            <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
              {content.regulatoryNotes}
            </p>
          </section>
        )}

        {/* リスク */}
        {content.risksAndUncertainties && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              リスクと不確実性
            </h2>
            <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
              {content.risksAndUncertainties}
            </p>
          </section>
        )}

        {/* 次のアクション */}
        {content.nextActions && content.nextActions.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              次のアクション
            </h2>
            <ol className="space-y-3 list-decimal list-inside text-brand-secondary">
              {content.nextActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ol>
          </section>
        )}

        {/* メールドラフト */}
        {content.emailDrafts && (
          <section>
            <h2 className="text-2xl font-bold text-brand-secondary mb-5">
              メールドラフト
            </h2>
            <div className="space-y-4">
              {content.emailDrafts.standard && (
                <div className="p-5 bg-brand-bg rounded-xl">
                  <h3 className="font-semibold text-brand-secondary mb-3">標準版</h3>
                  <p className="text-sm text-brand-secondary whitespace-pre-wrap leading-relaxed">
                    {content.emailDrafts.standard}
                  </p>
                </div>
              )}
              {content.emailDrafts.formal && (
                <div className="p-5 bg-brand-bg rounded-xl">
                  <h3 className="font-semibold text-brand-secondary mb-3">フォーマル版</h3>
                  <p className="text-sm text-brand-secondary whitespace-pre-wrap leading-relaxed">
                    {content.emailDrafts.formal}
                  </p>
                </div>
              )}
              {content.emailDrafts.casual && (
                <div className="p-5 bg-brand-bg rounded-xl">
                  <h3 className="font-semibold text-brand-secondary mb-3">カジュアル版</h3>
                  <p className="text-sm text-brand-secondary whitespace-pre-wrap leading-relaxed">
                    {content.emailDrafts.casual}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* フッター */}
      <div className="flex justify-between pt-2">
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </Button>
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalDetailView;
