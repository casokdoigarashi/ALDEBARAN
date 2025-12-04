
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  confidence?: number;
}

const Input: React.FC<InputProps> = ({ label, id, error, confidence, ...props }) => {
  const isLowConfidence = confidence !== undefined && confidence < 0.8;
  const confidenceColor = isLowConfidence ? 'border-yellow-500 ring-yellow-500' : 'border-brand-accent focus:border-brand-primary focus:ring-brand-primary';

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-serif-jp font-serif-jp font-medium text-brand-secondary mb-2">
        {label}
        {isLowConfidence && <span className="text-yellow-600 text-xs ml-2">(要確認)</span>}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-sm shadow-sm focus:outline-none focus:ring-1 sm:text-sm font-serif-jp ${confidenceColor}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 font-serif-jp">{error}</p>}
    </div>
  );
};

export default Input;
