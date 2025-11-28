
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 sm:p-8 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-brand-secondary mb-6">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
