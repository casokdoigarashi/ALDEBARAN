// @ts-nocheck
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { ClipboardIcon } from '../icons/ClipboardIcon';

interface HeaderProps {
  onLogoClick: () => void;
  onNavigate: (view: 'CONCIERGE' | 'DATABASE' | 'PROPOSALS_LIST' | 'REPORTS') => void;
  currentView: 'CONCIERGE' | 'DATABASE' | 'PROPOSALS_LIST' | 'REPORTS';
}

const navItems = [
  { view: 'CONCIERGE' as const, label: '提案作成', icon: SparklesIcon },
  { view: 'DATABASE' as const, label: '原料DB', icon: DocumentTextIcon },
  { view: 'PROPOSALS_LIST' as const, label: '提案書一覧', icon: ClipboardIcon },
  { view: 'REPORTS' as const, label: 'レポート', icon: null },
];

const Header: React.FC<HeaderProps> = ({ onLogoClick, onNavigate, currentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-brand-accent/50 z-50 sticky top-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={onLogoClick}
          >
            <img src="/aldebaran_logo.jpg" alt="ALDEBARAN" className="h-7 w-auto" />
            <span className="ml-3 text-base font-semibold text-brand-secondary hidden sm:inline tracking-tight">
              OEM <span className="font-light text-brand-light">コンシェルジュ</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ view, label, icon: Icon }) => {
              const isActive = currentView === view;
              return (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-brand-primary bg-brand-primary/8'
                      : 'text-brand-light hover:text-brand-secondary hover:bg-brand-muted'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-primary rounded-full"></span>
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-brand-accent mx-2"></div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-brand-secondary leading-tight">{user?.name || 'ゲスト'}</div>
                {user?.department && (
                  <div className="text-xs text-brand-light">{user.department}</div>
                )}
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-brand-light hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
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
