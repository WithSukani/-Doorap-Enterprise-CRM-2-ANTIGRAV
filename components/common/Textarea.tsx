
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>}
      <textarea
        id={name}
        name={name}
        rows={3}
        className={`w-full px-3 py-2.5 bg-white border rounded-md shadow-sm transition-colors placeholder-zinc-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900
                    ${error 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-zinc-200 hover:border-zinc-300'}
                    ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Textarea;
