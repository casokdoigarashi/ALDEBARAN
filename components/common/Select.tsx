
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

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-brand-secondary mb-1.5">
        {label}
        {isLowConfidence && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            要確認
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`appearance-none w-full px-4 py-2.5 border rounded-xl text-sm bg-white transition-all duration-200
            ${isLowConfidence
              ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
              : 'border-gray-200 hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'
            }
            focus:outline-none`}
          {...props}
        >
          <option value="">選択してください</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
