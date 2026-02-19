import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';
import Card from './common/Card';
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
    <div className="space-y-8 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary">レポート</h1>
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
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

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 総提案書数 */}
          <div className="bg-white rounded-2xl shadow-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-primary-light" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {stats.totalProposals}
                </div>
                <p className="text-brand-secondary font-medium">総提案書数</p>
                <p className="text-xs text-brand-light mt-2">
                  すべての提案書
                </p>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-xl">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 下書き提案書 */}
          <div className="bg-white rounded-2xl shadow-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-300" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {stats.draftProposals}
                </div>
                <p className="text-brand-secondary font-medium">下書き提案書</p>
                <p className="text-xs text-brand-light mt-2">
                  編集中の提案書
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 完成提案書 */}
          <div className="bg-white rounded-2xl shadow-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.completedProposals}
                </div>
                <p className="text-brand-secondary font-medium">完成提案書</p>
                <p className="text-xs text-brand-light mt-2">
                  完成した提案書
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 原料数 */}
          <div className="bg-white rounded-2xl shadow-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent to-gray-300" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-brand-light mb-2">
                  {stats.totalMaterials}
                </div>
                <p className="text-brand-secondary font-medium">登録原料数</p>
                <p className="text-xs text-brand-light mt-2">
                  データベース内の原料
                </p>
              </div>
              <div className="p-3 bg-brand-muted rounded-xl">
                <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細統計 */}
      {stats && (
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-brand-secondary mb-8">
            詳細統計
          </h2>

          <div className="space-y-8">
            {/* 提案書の状態分布 */}
            <div>
              <h3 className="text-lg font-semibold text-brand-secondary mb-5">
                提案書の状態分布
              </h3>
              <div className="space-y-5">
                {/* 下書き */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm text-brand-secondary font-medium">下書き</span>
                    <span className="text-sm font-semibold text-brand-secondary">
                      {stats.draftProposals} 件
                      {stats.totalProposals > 0 && (
                        <span className="text-xs text-brand-light ml-2">
                          ({Math.round((stats.draftProposals / stats.totalProposals) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-300 h-2.5 rounded-full transition-all duration-500"
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
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm text-brand-secondary font-medium">完成</span>
                    <span className="text-sm font-semibold text-brand-secondary">
                      {stats.completedProposals} 件
                      {stats.totalProposals > 0 && (
                        <span className="text-xs text-brand-light ml-2">
                          ({Math.round((stats.completedProposals / stats.totalProposals) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
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
              <h3 className="text-lg font-semibold text-brand-secondary mb-5">
                主要指標
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 bg-brand-bg rounded-xl">
                  <p className="text-sm text-brand-light mb-2">完成率</p>
                  <p className="text-3xl font-bold text-brand-primary">
                    {stats.totalProposals > 0
                      ? Math.round((stats.completedProposals / stats.totalProposals) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-5 bg-brand-bg rounded-xl">
                  <p className="text-sm text-brand-light mb-2">平均提案書数</p>
                  <p className="text-3xl font-bold text-brand-primary">
                    {stats.totalProposals}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 更新ボタン */}
      <div className="flex justify-center pt-2">
        <Button onClick={fetchStats} variant="outline" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          統計を更新
        </Button>
      </div>
    </div>
  );
};

export default ReportsPage;
