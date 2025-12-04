
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
  onNavigate: (view: 'CONCIERGE' | 'DATABASE') => void;
  currentView: 'CONCIERGE' | 'DATABASE';
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onNavigate, currentView }) => {
  return (
    <header className="bg-white border-b border-brand-accent z-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <img src="/aldebaran_logo.jpg" alt="ALDEBARAN" className="h-6 w-auto" />
            <span className="ml-3 text-lg font-serif-jp font-semibold text-brand-secondary hidden sm:inline">
              <span className="font-light text-brand-secondary text-base">OEM コンシェルジュ</span>
            </span>
            <span className="ml-3 text-base font-serif-jp font-semibold text-brand-secondary sm:hidden">
              <span className="font-light text-brand-secondary">OEM</span>
            </span>
          </div>
          
          <nav className="flex space-x-6">
             <button 
                onClick={() => onNavigate('CONCIERGE')}
                className={`px-3 py-2 text-sm font-serif-jp font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'CONCIERGE' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
                }`}
             >
                提案作成
             </button>
             <button 
                onClick={() => onNavigate('DATABASE')}
                className={`px-3 py-2 text-sm font-serif-jp font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'DATABASE' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
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
