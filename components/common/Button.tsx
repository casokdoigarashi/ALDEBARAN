
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-2 font-serif-jp font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm';

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-yellow-700 focus:ring-brand-primary',
    secondary: 'bg-brand-secondary text-white hover:bg-gray-800 focus:ring-brand-secondary',
    outline: 'bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-bg focus:ring-brand-primary',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
