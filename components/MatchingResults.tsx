
import React from 'react';
import { ScoredProposal } from '../types';
import Button from './common/Button';
import Card from './common/Card';

interface MatchingResultsProps {
  proposals: ScoredProposal[];
  onSelect: (proposal: ScoredProposal) => void;
  onBack: () => void;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const bgColor = score > 85 ? 'bg-green-100 text-green-800' : score > 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    return (
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${bgColor}`}>
            スコア: {score.toFixed(1)}
        </span>
    );
}

const MatchingResults: React.FC<MatchingResultsProps> = ({ proposals, onSelect, onBack }) => {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-secondary">マッチング結果</h1>
        <p className="mt-2 text-md text-brand-light">
          ご要件に基づいた上位の提案です。一つ選択して詳細なドキュメントを生成してください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {proposals.map(proposal => (
          <Card key={proposal.id} className={`flex flex-col h-full ${proposal.rank === 1 ? 'border-2 border-brand-primary' : ''}`}>
             {proposal.rank === 1 && <div className="text-center bg-brand-primary text-white font-bold py-1 px-4 rounded-t-lg -mt-8 -mx-8 mb-6">ベストマッチ</div>}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-brand-secondary">{proposal.productNameSuggestion}</h2>
              <ScoreBadge score={proposal.score} />
            </div>
            <p className="text-brand-light mb-4 flex-grow">{proposal.conceptSummary}</p>
            
            <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-800 mb-2">主な特徴:</h3>
                <ul className="list-disc list-inside text-sm text-brand-light space-y-1">
                    {proposal.keyFeatures.map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
            </div>
            
            <Button onClick={() => onSelect(proposal)} className="w-full mt-auto">
              詳細な提案書を生成
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button variant="outline" onClick={onBack}>
          入力内容の編集に戻る
        </Button>
      </div>
    </div>
  );
};

export default MatchingResults;