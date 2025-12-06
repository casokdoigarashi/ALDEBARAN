// @ts-nocheck
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onLogoClick: () => void;
  onNavigate: (view: 'CONCIERGE' | 'DATABASE' | 'PROPOSALS_LIST' | 'REPORTS') => void;
  currentView: 'CONCIERGE' | 'DATABASE' | 'PROPOSALS_LIST' | 'REPORTS';
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onNavigate, currentView }) => {
  const { user, logout } = useAuth();

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
          
          <nav className="flex items-center space-x-4">
             <button 
                onClick={() => onNavigate('CONCIERGE')}
                className={`px-3 py-2 text-sm font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'CONCIERGE' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
                }`}
             >
                提案作成
             </button>
             <button 
                onClick={() => onNavigate('DATABASE')}
                className={`px-3 py-2 text-sm font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'DATABASE' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
                }`}
             >
                原料DB
             </button>
             <button 
                onClick={() => onNavigate('PROPOSALS_LIST')}
                className={`px-3 py-2 text-sm font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'PROPOSALS_LIST' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
                }`}
             >
                📋 提案書一覧
             </button>
             <button 
                onClick={() => onNavigate('REPORTS')}
                className={`px-3 py-2 text-sm font-serif-jp font-medium transition-colors border-b-2 ${
                    currentView === 'REPORTS' 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-primary'
                }`}
             >
                📊 レポート
             </button>

             {/* ユーザーメニュー */}
             <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-brand-accent">
               <div className="text-sm text-brand-secondary">
                 <div className="font-medium">{user?.name || 'ゲスト'}</div>
                 {user?.department && (
                   <div className="text-xs text-brand-light">{user.department}</div>
                 )}
               </div>
               <button
                 onClick={logout}
                 className="px-3 py-1 text-sm font-serif-jp text-brand-secondary hover:text-brand-primary transition-colors border border-brand-accent rounded hover:border-brand-primary"
               >
                 ログアウト
               </button>
             </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
