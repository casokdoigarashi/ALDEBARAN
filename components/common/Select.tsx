
import React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  confidence?: number;
}

const Select: React.FC<SelectProps> = ({ label, id, options, error, confidence, ...props }) => {
  const isLowConfidence = confidence !== undefined && confidence < 0.8;
  const confidenceColor = isLowConfidence ? 'border-yellow-500 ring-yellow-500' : 'border-brand-accent focus:border-brand-primary focus:ring-brand-primary';

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-serif-jp font-serif-jp font-medium text-brand-secondary mb-2">
        {label}
        {isLowConfidence && <span className="text-yellow-600 text-xs ml-2">(要確認)</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`appearance-none w-full px-3 py-2 border rounded-sm shadow-sm focus:outline-none focus:ring-1 sm:text-sm font-serif-jp ${confidenceColor}`}
          {...props}
        >
          <option value="">選択してください</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-secondary">
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600 font-serif-jp">{error}</p>}
    </div>
  );
};

export default Select;
