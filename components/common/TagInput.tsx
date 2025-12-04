
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
    <div className="mb-4">
      <label className="block text-sm font-serif-jp font-medium text-brand-secondary mb-2">
        {label}
        {isLowConfidence && <span className="text-yellow-600 text-xs ml-2">(要確認)</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={`px-3 py-1.5 rounded-full text-sm font-serif-jp font-medium transition-colors duration-200 ${
                isSelected
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-200 text-brand-secondary hover:bg-gray-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagInput;
