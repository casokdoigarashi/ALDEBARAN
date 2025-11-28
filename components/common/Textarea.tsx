import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  confidence?: number;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, confidence, ...props }) => {
  const isLowConfidence = confidence !== undefined && confidence < 0.8;
  const confidenceColor = isLowConfidence ? 'border-yellow-500 ring-yellow-500' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary';

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isLowConfidence && <span className="text-yellow-600 text-xs ml-2">(要確認)</span>}
      </label>
      <textarea
        id={id}
        rows={6}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${confidenceColor}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;
