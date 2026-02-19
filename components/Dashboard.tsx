
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface DashboardProps {
  onStartNewProposal: () => void;
  onViewProposals?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartNewProposal, onViewProposals }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
          <SparklesIcon className="w-4 h-4" />
          AI-Powered OEM Concierge
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-brand-secondary mb-5 leading-tight tracking-tight">
          AI OEM コンシェルジュへ
          <br />
          <span className="font-display text-brand-primary">ようこそ</span>
        </h1>
        <p className="text-lg text-brand-light max-w-xl mx-auto leading-relaxed">
          包括的で正確な製品提案書を数分で作成します。
          <br className="hidden sm:block" />
          AIがあなたの最適なOEM提案をサポートします。
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Proposal Card */}
        <div
          onClick={onStartNewProposal}
          className="group cursor-pointer bg-white border border-brand-accent/60 rounded-2xl p-8 sm:p-10 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <SparklesIcon className="w-7 h-7 text-brand-primary" />
          </div>

          <h2 className="text-xl font-semibold text-brand-secondary mb-3">新規提案を作成</h2>
          <p className="text-brand-light text-sm leading-relaxed mb-8">
            クライアントからの問い合わせメール、企画書、またはWebページから、AIが自動で要件を抽出し、最適な提案書を作成します。
          </p>

          <Button size="lg" className="group-hover:shadow-glow">
            <SparklesIcon className="w-4 h-4 mr-2" />
            作成を開始
          </Button>
        </div>

        {/* Proposals List Card */}
        <div
          onClick={onViewProposals}
          className="group cursor-pointer bg-white border border-brand-accent/60 rounded-2xl p-8 sm:p-10 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <DocumentTextIcon className="w-7 h-7 text-brand-secondary" />
          </div>

          <h2 className="text-xl font-semibold text-brand-secondary mb-3">提案書一覧</h2>
          <p className="text-brand-light text-sm leading-relaxed mb-8">
            過去に作成した提案書を確認、編集、または削除できます。
          </p>

          {onViewProposals && (
            <Button variant="secondary" size="lg">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              一覧を表示
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
