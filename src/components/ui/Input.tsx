// Composants de formulaire standardisés
import React from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm',
            'px-3 py-2.5 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
            'transition-all duration-150',
            icon && 'pl-9',
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm',
          'px-3 py-2.5',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
          'transition-all duration-150',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={cn(
          'w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm',
          'px-3 py-2.5 placeholder-gray-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
          'transition-all duration-150',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={inputId} className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        id={inputId}
        className={cn(
          'w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-600',
          'focus:ring-green-500/50 focus:ring-2',
          className
        )}
        {...props}
      />
      <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">
        {label}
      </span>
    </label>
  );
}
