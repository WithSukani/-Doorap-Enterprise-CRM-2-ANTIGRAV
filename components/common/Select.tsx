
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  name, 
  error, 
  className = '', 
  containerClassName = '', 
  options, 
  placeholder, 
  ...restHTMLProps 
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select
            id={name}
            name={name}
            className={`w-full px-3 py-2.5 bg-white border rounded-md shadow-sm transition-colors text-sm appearance-none
                        focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900
                        ${error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-zinc-200 hover:border-zinc-300'}
                        ${className}`}
            {...restHTMLProps}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
