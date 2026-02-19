
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, padding = 'lg' }) => {
  const paddingClasses = {
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={`bg-white border border-brand-accent/60 shadow-card rounded-2xl ${paddingClasses[padding]} ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-brand-secondary">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-brand-light">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
