
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface DashboardProps {
  onStartNewProposal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartNewProposal }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-secondary">AI OEM コンシェルジュへようこそ</h1>
        <p className="mt-4 text-lg text-gray-600">
          包括的で正確な製品提案書を数分で作成します。
        </p>
      </div>
      
      <Card className="flex flex-col items-center text-center py-12 border-2 border-transparent hover:border-brand-light transition-all duration-300">
        <div className="flex justify-center items-center gap-4 mb-6">
             <div className="p-4 bg-green-50 rounded-full">
                <SparklesIcon className="w-10 h-10 text-brand-primary" />
             </div>
             <div className="p-4 bg-blue-50 rounded-full">
                <DocumentTextIcon className="w-10 h-10 text-blue-600" />
             </div>
             <div className="p-4 bg-purple-50 rounded-full">
                <GlobeAltIcon className="w-10 h-10 text-purple-600" />
             </div>
        </div>

        <h2 className="text-3xl font-bold text-brand-secondary mb-4">新規提案を作成</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
          クライアントからの問い合わせメール（テキスト）、企画書（PDF）、または参考製品のWebページ（URL）から、AIが自動で要件を抽出し、最適な提案書を作成します。
        </p>
        
        <Button onClick={onStartNewProposal} className="text-lg px-10 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
          提案作成を開始する
        </Button>
      </Card>
    </div>
  );
};

export default Dashboard;