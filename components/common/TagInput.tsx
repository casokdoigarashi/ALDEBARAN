
import React from 'react';

interface TagInputProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  confidence?: number;
}

const TagInput: React.FC<TagInputProps> = ({ label, options, selectedOptions, onChange, confidence }) => {
  const handleToggle = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  const isLowConfidence = confidence !== undefined && confidence < 0.8;

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-brand-secondary mb-2">
        {label}
        {isLowConfidence && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            要確認
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-brand-primary text-white border-brand-primary shadow-soft'
                  : 'bg-white text-brand-light border-gray-200 hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              {isSelected && <span className="mr-1">&#10003;</span>}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagInput;
