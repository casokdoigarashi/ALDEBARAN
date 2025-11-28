
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
  onNavigate: (view: 'CONCIERGE' | 'DATABASE') => void;
  currentView: 'CONCIERGE' | 'DATABASE';
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onNavigate, currentView }) => {
  return (
    <header className="bg-white shadow-md z-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <span className="ml-3 text-2xl font-bold text-brand-secondary hidden sm:inline">
              ALDEBARAN <span className="font-light text-brand-primary">AI OEM コンシェルジュ</span>
            </span>
            <span className="ml-3 text-xl font-bold text-brand-secondary sm:hidden">
              ALDEBARAN <span className="font-light text-brand-primary">AI</span>
            </span>
          </div>
          
          <nav className="flex space-x-4">
             <button 
                onClick={() => onNavigate('CONCIERGE')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'CONCIERGE' 
                    ? 'bg-brand-primary text-white' 
                    : 'text-gray-600 hover:text-brand-primary hover:bg-green-50'
                }`}
             >
                提案作成
             </button>
             <button 
                onClick={() => onNavigate('DATABASE')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'DATABASE' 
                    ? 'bg-brand-primary text-white' 
                    : 'text-gray-600 hover:text-brand-primary hover:bg-green-50'
                }`}
             >
                原料DB
             </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;