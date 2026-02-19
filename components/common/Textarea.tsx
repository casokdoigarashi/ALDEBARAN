import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  confidence?: number;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, confidence, ...props }) => {
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
      <textarea
        id={id}
        rows={5}
        className={`w-full px-4 py-3 border rounded-xl text-sm bg-white transition-all duration-200 placeholder:text-gray-400 resize-y
          ${isLowConfidence
            ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
            : 'border-gray-200 hover:border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'
          }
          focus:outline-none`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
