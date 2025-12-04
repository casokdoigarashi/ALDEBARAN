import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';
import Loader from './common/Loader';

interface Stats {
  totalProposals: number;
  draftProposals: number;
  completedProposals: number;
  totalMaterials: number;
}

interface ReportsPageProps {
  onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('統計情報の取得に失敗しました');
      }

      const data = await response.json();
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError('レポートの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="レポートを読み込み中..." />;
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif-jp font-bold text-brand-secondary">レポート</h1>
        <Button onClick={onBack} variant="secondary">
          戻る
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 総提案書数 */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-brand-primary">
            <div className="text-4xl font-serif-jp font-bold text-brand-primary mb-2">
              {stats.totalProposals}
            </div>
            <p className="text-brand-secondary font-serif-jp">総提案書数</p>
            <p className="text-xs text-brand-secondary mt-2">
              すべての提案書
            </p>
          </div>

          {/* 下書き提案書 */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
            <div className="text-4xl font-serif-jp font-bold text-yellow-600 mb-2">
              {stats.draftProposals}
            </div>
            <p className="text-brand-secondary font-serif-jp">下書き提案書</p>
            <p className="text-xs text-brand-secondary mt-2">
              編集中の提案書
            </p>
          </div>

          {/* 完成提案書 */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
            <div className="text-4xl font-serif-jp font-bold text-green-600 mb-2">
              {stats.completedProposals}
            </div>
            <p className="text-brand-secondary font-serif-jp">完成提案書</p>
            <p className="text-xs text-brand-secondary mt-2">
              完成した提案書
            </p>
          </div>

          {/* 原料数 */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-brand-accent">
            <div className="text-4xl font-serif-jp font-bold text-brand-accent mb-2">
              {stats.totalMaterials}
            </div>
            <p className="text-brand-secondary font-serif-jp">登録原料数</p>
            <p className="text-xs text-brand-secondary mt-2">
              データベース内の原料
            </p>
          </div>
        </div>
      )}

      {/* 詳細統計 */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-serif-jp font-bold text-brand-secondary mb-6">
            詳細統計
          </h2>

          <div className="space-y-6">
            {/* 提案書の状態分布 */}
            <div>
              <h3 className="text-lg font-serif-jp font-semibold text-brand-secondary mb-4">
                提案書の状態分布
              </h3>
              <div className="space-y-3">
                {/* 下書き */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-brand-secondary">下書き</span>
                    <span className="text-sm font-semibold text-brand-secondary">
                      {stats.draftProposals} 件
                      {stats.totalProposals > 0 && (
                        <span className="text-xs text-brand-secondary ml-2">
                          ({Math.round((stats.draftProposals / stats.totalProposals) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: stats.totalProposals > 0 
                          ? `${(stats.draftProposals / stats.totalProposals) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* 完成 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-brand-secondary">完成</span>
                    <span className="text-sm font-semibold text-brand-secondary">
                      {stats.completedProposals} 件
                      {stats.totalProposals > 0 && (
                        <span className="text-xs text-brand-secondary ml-2">
                          ({Math.round((stats.completedProposals / stats.totalProposals) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: stats.totalProposals > 0 
                          ? `${(stats.completedProposals / stats.totalProposals) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 主要指標 */}
            <div>
              <h3 className="text-lg font-serif-jp font-semibold text-brand-secondary mb-4">
                主要指標
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-brand-bg rounded">
                  <p className="text-sm text-brand-secondary mb-2">完成率</p>
                  <p className="text-2xl font-serif-jp font-bold text-brand-primary">
                    {stats.totalProposals > 0 
                      ? Math.round((stats.completedProposals / stats.totalProposals) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-4 bg-brand-bg rounded">
                  <p className="text-sm text-brand-secondary mb-2">平均提案書数</p>
                  <p className="text-2xl font-serif-jp font-bold text-brand-primary">
                    {stats.totalProposals}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 更新ボタン */}
      <div className="flex justify-center">
        <Button onClick={fetchStats}>
          統計を更新
        </Button>
      </div>
    </div>
  );
};

export default ReportsPage;
