
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface DashboardProps {
  onStartNewProposal: () => void;
  onViewProposals?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartNewProposal, onViewProposals }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-serif-jp font-semibold text-brand-secondary mb-4 leading-tight">
          AI OEM コンシェルジュへようこそ
        </h1>
        <p className="text-lg text-brand-light font-serif-jp">
          包括的で正確な製品提案書を数分で作成します。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 新規提案作成 */}
        <Card className="flex flex-col items-center text-center py-12 border-brand-accent hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-brand-bg rounded-sm mb-6">
            <SparklesIcon className="w-8 h-8 text-brand-primary" />
          </div>

          <h2 className="text-2xl font-serif-jp font-semibold text-brand-secondary mb-4">新規提案を作成</h2>
          <p className="text-brand-light font-serif-jp mb-8 text-sm leading-relaxed">
            クライアントからの問い合わせメール、企画書、またはWebページから、AIが自動で要件を抽出し、最適な提案書を作成します。
          </p>
          
          <Button onClick={onStartNewProposal} className="text-sm px-8 py-2">
            作成を開始
          </Button>
        </Card>

        {/* 提案書一覧 */}
        <Card className="flex flex-col items-center text-center py-12 border-brand-accent hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-brand-bg rounded-sm mb-6">
            <DocumentTextIcon className="w-8 h-8 text-brand-primary" />
          </div>

          <h2 className="text-2xl font-serif-jp font-semibold text-brand-secondary mb-4">提案書一覧</h2>
          <p className="text-brand-light font-serif-jp mb-8 text-sm leading-relaxed">
            過去に作成した提案書を確認、編集、または削除できます。
          </p>
          
          {onViewProposals && (
            <Button onClick={onViewProposals} className="text-sm px-8 py-2">
              一覧を表示
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
