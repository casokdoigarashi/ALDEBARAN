
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface DashboardProps {
  onStartNewProposal: () => void;
  onNavigateToDatabase: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartNewProposal, onNavigateToDatabase }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-serif-jp font-semibold text-brand-secondary mb-4 leading-tight">
          OEM コンシェルジュを始める
        </h1>
        <p className="text-lg text-brand-light font-serif-jp">
          製品提案書をサポートします。
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8 mb-12 max-w-3xl w-full">
        <Card className="flex-1 flex flex-col items-center text-center py-12 border-brand-accent hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-brand-bg rounded-sm mb-6">
            <SparklesIcon className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-serif-jp font-semibold text-brand-secondary mb-4">提案作成</h2>
          <p className="text-brand-light font-serif-jp mb-8 text-sm leading-relaxed">
            お問い合わせメール、企画書、参考製品から提案を自動生成
          </p>
          <Button onClick={onStartNewProposal} className="text-base px-8 py-2 shadow-sm hover:shadow-md">
            提案作成を開始する
          </Button>
        </Card>
        
        <Card className="flex-1 flex flex-col items-center text-center py-12 border-brand-accent hover:shadow-md transition-all duration-300">
          <div className="p-4 bg-brand-bg rounded-sm mb-6">
            <DocumentTextIcon className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-serif-jp font-semibold text-brand-secondary mb-4">原料DB</h2>
          <p className="text-brand-light font-serif-jp mb-8 text-sm leading-relaxed">
            自社保有の原料を検索、管理
          </p>
          <Button onClick={onNavigateToDatabase} className="text-base px-8 py-2 shadow-sm hover:shadow-md">
            原料DBを開く
          </Button>
        </Card>
      </div>
      
      <div className="max-w-2xl text-center">
        <p className="text-brand-light font-serif-jp text-sm leading-relaxed">
          お問い合わせメール（テキスト）、企画書（PDF）、または参考製品のWebページ（URL）から、AIが自動で要件を抽出し、提案書を作成します。
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
