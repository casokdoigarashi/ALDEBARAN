import React, { useState } from 'react';
import { FullProposal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { downloadProposalAsPdf, downloadProposalAsHtml } from '../services/pdfService';
import { regenerateEmailDraft, saveEmailDraft } from '../services/emailService';
import Button from './common/Button';
import EmailDraftEditor from './EmailDraftEditor';

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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-brand-primary hover:text-brand-secondary transition-colors"
        >
          ← 戻る
        </button>
        <div className="flex space-x-3">
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
            >
              エクスポート ▼
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-brand-accent">
                <button
                  onClick={handleExportPdf}
                  className="w-full text-left px-4 py-2 hover:bg-brand-bg transition-colors text-sm font-serif-jp"
                >
                  📄 PDF として出力
                </button>
                <button
                  onClick={handleExportHtml}
                  className="w-full text-left px-4 py-2 hover:bg-brand-bg transition-colors text-sm font-serif-jp border-t border-brand-accent"
                >
                  🌐 HTML として出力
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full text-left px-4 py-2 hover:bg-brand-bg transition-colors text-sm font-serif-jp border-t border-brand-accent"
                >
                  🖨️ 印刷
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          ✓ 提案書を保存しました
        </div>
      )}

      {/* 提案書内容 */}
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* タイトル */}
        <div className="border-b border-brand-accent pb-6">
          <h1 className="text-4xl font-serif-jp font-bold text-brand-secondary mb-2">
            {content.productNameSuggestions?.[0] || '提案書'}
          </h1>
          <p className="text-xl text-brand-primary font-serif-jp">
            {content.tagline}
          </p>
        </div>

        {/* エグゼクティブサマリー */}
        {content.executiveSummary && (
          <section>
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              エグゼクティブサマリー
            </h2>
            <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
              {content.executiveSummary}
            </p>
          </section>
        )}

        {/* コンセプト */}
        <section>
          <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
            コンセプト
          </h2>
          <p className="text-brand-secondary leading-relaxed whitespace-pre-wrap">
            {content.conceptSummary}
          </p>
        </section>

        {/* 主要成分 */}
        {content.mainIngredients && content.mainIngredients.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              主要成分
            </h2>
            <div className="space-y-3">
              {content.mainIngredients.map((ingredient, idx) => (
                <div key={idx} className="p-3 bg-brand-bg rounded">
                  <p className="font-semibold text-brand-secondary">
                    {ingredient.commonName}
                    {ingredient.isInternalMaterial && (
                      <span className="ml-2 text-xs bg-brand-primary text-white px-2 py-1 rounded">
                        自社原料
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-brand-secondary">INCI: {ingredient.inci}</p>
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
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              期待される機能
            </h2>
            <ul className="space-y-2">
              {content.expectedFunctions.map((func, idx) => (
                <li key={idx} className="flex space-x-3">
                  <span className="text-brand-primary">▪</span>
                  <div>
                    <p className="font-semibold text-brand-secondary">{func.func}</p>
                    <p className="text-sm text-brand-secondary">{func.evidence}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* パッケージ提案 */}
        {content.packageProposals && content.packageProposals.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              パッケージ提案
            </h2>
            <div className="space-y-4">
              {content.packageProposals.map((pkg, idx) => (
                <div key={idx} className="p-4 border border-brand-accent rounded">
                  <h3 className="font-semibold text-brand-secondary mb-2">{pkg.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-brand-secondary">
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
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              コスト見積
            </h2>
            <div className="p-4 bg-brand-bg rounded space-y-2 text-sm text-brand-secondary">
              <p><strong>原料:</strong> {content.costRange.materials}</p>
              <p><strong>充填:</strong> {content.costRange.filling}</p>
              <p><strong>容器:</strong> {content.costRange.container}</p>
              <p><strong>印刷:</strong> {content.costRange.printing}</p>
              <p className="border-t border-brand-accent pt-2 font-semibold">
                <strong>合計:</strong> {content.costRange.total}
              </p>
            </div>
          </section>
        )}

        {/* 規制上の注記 */}
        {content.regulatoryNotes && (
          <section>
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
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
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
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
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              次のアクション
            </h2>
            <ol className="space-y-2 list-decimal list-inside text-brand-secondary">
              {content.nextActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ol>
          </section>
        )}

        {/* メールドラフト */}
        {content.emailDrafts && (
          <section>
            <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-4">
              メールドラフト
            </h2>
            <div className="space-y-4">
              {content.emailDrafts.standard && (
                <EmailDraftEditor
                  title="標準版"
                  initialContent={content.emailDrafts.standard}
                  draftType="standard"
                  proposalId={proposalId || ''}
                  onRegenerate={async (draftType, tone) => {
                    return await regenerateEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      tone,
                      content.emailDrafts[draftType as 'standard' | 'formal' | 'casual']
                    );
                  }}
                  onSave={async (draftType, newContent) => {
                    await saveEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      newContent
                    );
                  }}
                />
              )}
              {content.emailDrafts.formal && (
                <EmailDraftEditor
                  title="フォーマル版"
                  initialContent={content.emailDrafts.formal}
                  draftType="formal"
                  proposalId={proposalId || ''}
                  onRegenerate={async (draftType, tone) => {
                    return await regenerateEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      tone,
                      content.emailDrafts[draftType as 'standard' | 'formal' | 'casual']
                    );
                  }}
                  onSave={async (draftType, newContent) => {
                    await saveEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      newContent
                    );
                  }}
                />
              )}
              {content.emailDrafts.casual && (
                <EmailDraftEditor
                  title="カジュアル版"
                  initialContent={content.emailDrafts.casual}
                  draftType="casual"
                  proposalId={proposalId || ''}
                  onRegenerate={async (draftType, tone) => {
                    return await regenerateEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      tone,
                      content.emailDrafts[draftType as 'standard' | 'formal' | 'casual']
                    );
                  }}
                  onSave={async (draftType, newContent) => {
                    await saveEmailDraft(
                      proposalId || '',
                      draftType as 'standard' | 'formal' | 'casual',
                      newContent
                    );
                  }}
                />
              )}
            </div>
          </section>
        )}
      </div>

      {/* フッター */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="secondary">
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
