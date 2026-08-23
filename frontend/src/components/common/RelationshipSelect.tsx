import React from 'react';
import { RELATIONSHIP_CATEGORIES } from '@/lib/utils';


export interface RelationshipSelectProps {
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  error?: string;
}

export const RelationshipSelect: React.FC<RelationshipSelectProps> = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Select relationship',
  className = '',
  disabled = false,
  required = false,
  id,
  name,
  error,
}) => {
  return (
    <div className="w-full">
      <select
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs sm:text-sm ${
          error ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
      >
        <option value="">{placeholder}</option>
        {RELATIONSHIP_CATEGORIES.map((cat) => (
          <optgroup key={cat.category} label={cat.category}>
            {cat.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && <p className="text-rose-500 text-[10px] font-semibold mt-1">{error}</p>}
    </div>
  );
};

export default RelationshipSelect;
