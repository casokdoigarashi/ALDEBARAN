import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';
import Loader from './common/Loader';

interface Proposal {
  id: string;
  client_name: string;
  website_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProposalsListProps {
  onSelectProposal: (proposalId: string) => void;
  onNewProposal: () => void;
}

const ProposalsList: React.FC<ProposalsListProps> = ({ onSelectProposal, onNewProposal }) => {
  const { token } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proposals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('提案書の取得に失敗しました');
      }

      const data = await response.json();
      setProposals(data.proposals || []);
      setError('');
    } catch (err) {
      setError('提案書の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!window.confirm('この提案書を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      setProposals(proposals.filter(p => p.id !== proposalId));
    } catch (err) {
      alert('提案書の削除に失敗しました');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loader message="提案書を読み込み中..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-secondary">提案書一覧</h1>
        <Button onClick={onNewProposal} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しい提案書を作成
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* 提案書がない場合 */}
      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card border border-brand-accent/60">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-brand-light text-lg mb-2">提案書がまだありません</p>
          <p className="text-brand-light text-sm mb-6">最初の提案書を作成して始めましょう</p>
          <Button onClick={onNewProposal} size="lg">
            最初の提案書を作成
          </Button>
        </div>
      ) : (
        /* 提案書リスト */
        <div className="grid gap-5">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-2xl border border-brand-accent/60 shadow-card p-6 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-brand-secondary mb-2 truncate">
                    {proposal.client_name}
                  </h3>
                  {proposal.website_url && (
                    <p className="text-sm text-brand-secondary mb-3">
                      <a
                        href={proposal.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:underline"
                      >
                        {proposal.website_url}
                      </a>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-light">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      作成: {formatDate(proposal.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      更新: {formatDate(proposal.updated_at)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      proposal.status === 'completed'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {proposal.status === 'completed' ? '完成' : '下書き'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-6 flex-shrink-0">
                  <Button
                    onClick={() => onSelectProposal(proposal.id)}
                    size="sm"
                  >
                    表示
                  </Button>
                  <Button
                    onClick={() => handleDelete(proposal.id)}
                    variant="danger"
                    size="sm"
                  >
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalsList;
