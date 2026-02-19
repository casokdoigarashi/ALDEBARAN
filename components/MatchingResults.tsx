
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
    const bgColor = score > 85
      ? 'bg-green-50 text-green-700 border border-green-200'
      : score > 70
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-red-50 text-red-700 border border-red-200';
    return (
        <span className={`px-3 py-1.5 text-sm font-semibold rounded-xl ${bgColor}`}>
            スコア: {score.toFixed(1)}
        </span>
    );
}

const MatchingResults: React.FC<MatchingResultsProps> = ({ proposals, onSelect, onBack }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-brand-secondary">マッチング結果</h1>
        <p className="mt-3 text-md text-brand-light max-w-2xl mx-auto">
          ご要件に基づいた上位の提案です。一つ選択して詳細なドキュメントを生成してください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {proposals.map(proposal => (
          <div
            key={proposal.id}
            className={`relative group ${proposal.rank === 1 ? 'lg:-mt-2' : ''}`}
          >
            {/* Gradient border highlight for best match */}
            {proposal.rank === 1 && (
              <div className="absolute -inset-[2px] bg-gradient-to-br from-brand-primary via-brand-primary-light to-brand-primary rounded-2xl opacity-100" />
            )}
            <Card className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${proposal.rank === 1 ? '!border-transparent' : ''}`}>
              {proposal.rank === 1 && (
                <div className="text-center bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white font-semibold py-2 px-4 rounded-xl -mt-4 -mx-4 mb-6 text-sm tracking-wide">
                  ベストマッチ
                </div>
              )}
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-xl font-bold text-brand-secondary leading-tight pr-3">{proposal.productNameSuggestion}</h2>
                <ScoreBadge score={proposal.score} />
              </div>
              <p className="text-brand-light mb-5 flex-grow leading-relaxed">{proposal.conceptSummary}</p>

              <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-800 mb-3">主な特徴:</h3>
                  <ul className="space-y-2">
                      {proposal.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-brand-light">
                          <span className="text-brand-primary mt-0.5 flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
              </div>

              <Button onClick={() => onSelect(proposal)} size="lg" className="w-full mt-auto">
                詳細な提案書を生成
              </Button>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Button variant="outline" onClick={onBack}>
          入力内容の編集に戻る
        </Button>
      </div>
    </div>
  );
};

export default MatchingResults;
