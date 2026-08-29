import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { formatUSPhoneInput, isValidUSPhone } from '@/lib/utils';


export interface PhoneInputProps {
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
  showValidationHint?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  onBlur,
  placeholder = '(512) 555-0100',
  className = '',
  disabled = false,
  required = false,
  id,
  name,
  error,
  showValidationHint = true,
}) => {
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatUSPhoneInput(raw);
    onChange?.(formatted);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const handleClear = () => {
    onChange?.('');
  };

  const isCompleteAndValid = isValidUSPhone(value);
  const activeError = error || ((touched && value.length > 0 && !isCompleteAndValid) ? 'Please enter a valid 10-digit US phone number, e.g. (512) 555-0100' : '');
  const hasError = Boolean(activeError);

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 w-full">
        {/* US Country Prefix Badge - Compact & Sleek */}
        <div className="flex items-center gap-1 px-2.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs shrink-0 select-none">
          <span>🇺🇸</span>
          <span className="font-mono text-slate-700 font-bold">+1</span>
        </div>

        {/* Input Container */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <input
            id={id}
            name={name}
            type="tel"
            disabled={disabled}
            required={required}
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={25}
            className={`w-full px-3 py-2.5 pr-9 bg-slate-50/60 border rounded-xl font-semibold text-slate-900 focus:outline-none transition-all text-xs sm:text-sm tracking-wide ${
              hasError
                ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-2 focus:ring-rose-500'
                : isCompleteAndValid
                ? 'border-emerald-300 focus:ring-emerald-400 bg-emerald-50/10'
                : 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
          />

          {/* Action & Status Icons */}
          <div className="absolute right-2 flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                title="Clear number"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {isCompleteAndValid && !hasError && (
              <span title="Valid US phone number">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              </span>
            )}
            {hasError && (
              <span title="Phone validation notice">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Field-level Validation Error Message */}
      {showValidationHint && hasError && (
        <p className="text-rose-500 text-[11px] font-bold mt-1 flex items-center gap-1 animate-in fade-in duration-150">
          <AlertCircle className="h-3.5 w-3.5 inline shrink-0 text-rose-500" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
