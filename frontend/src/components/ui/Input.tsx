import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, helperText, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-text-dark-tertiary text-text-light-tertiary">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-md border transition-all duration-200
            dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary
            dark:placeholder:text-text-dark-tertiary
            bg-light-elevated border-light-border text-text-light-primary
            placeholder:text-text-light-tertiary
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm
            ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">{helperText}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full rounded-md border transition-all duration-200
          dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary
          dark:placeholder:text-text-dark-tertiary
          bg-light-elevated border-light-border text-text-light-primary
          placeholder:text-text-light-tertiary
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          px-4 py-2.5 text-sm resize-none
          ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : ''}
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium dark:text-text-dark-secondary text-text-light-secondary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`
          w-full rounded-md border transition-all duration-200 appearance-none
          dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary
          bg-light-elevated border-light-border text-text-light-primary
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          px-4 py-2.5 text-sm cursor-pointer
          ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
