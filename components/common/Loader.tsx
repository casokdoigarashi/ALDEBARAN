
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-brand-accent animate-ping opacity-20"></div>
        <div className="absolute inset-2 rounded-full border-2 border-brand-primary-light animate-ping opacity-30" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      <p className="text-lg font-semibold text-brand-secondary mb-2">{message}</p>
      <p className="text-sm text-brand-light">AIが最適な提案を準備中です。しばらくお待ちください...</p>
      <div className="mt-6 flex space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-soft"></div>
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-soft" style={{animationDelay: '0.3s'}}></div>
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-soft" style={{animationDelay: '0.6s'}}></div>
      </div>
    </div>
  );
};

export default Loader;
