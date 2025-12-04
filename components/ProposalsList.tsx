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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif-jp font-bold text-brand-secondary">提案書一覧</h1>
        <Button onClick={onNewProposal}>
          新しい提案書を作成
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* 提案書がない場合 */}
      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-brand-secondary mb-4">提案書がまだありません</p>
          <Button onClick={onNewProposal}>
            最初の提案書を作成
          </Button>
        </div>
      ) : (
        /* 提案書リスト */
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-lg border border-brand-accent p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-serif-jp font-semibold text-brand-secondary mb-2">
                    {proposal.client_name}
                  </h3>
                  {proposal.website_url && (
                    <p className="text-sm text-brand-secondary mb-2">
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
                  <div className="flex items-center space-x-4 text-xs text-brand-secondary">
                    <span>
                      作成: {formatDate(proposal.created_at)}
                    </span>
                    <span>
                      更新: {formatDate(proposal.updated_at)}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      proposal.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {proposal.status === 'completed' ? '完成' : '下書き'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onSelectProposal(proposal.id)}
                    className="px-4 py-2 bg-brand-primary text-white rounded hover:opacity-90 transition-opacity text-sm font-serif-jp"
                  >
                    表示
                  </button>
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-serif-jp"
                  >
                    削除
                  </button>
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
