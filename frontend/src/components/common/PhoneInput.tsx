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
  const showInvalidError = (touched || error) && value.length > 0 && !isCompleteAndValid;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {/* US Country Prefix Badge */}
        <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs shrink-0 select-none">
          <span className="text-sm">🇺🇸</span>
          <span className="font-mono text-slate-600 font-bold">+1</span>
        </div>

        {/* Input Container */}
        <div className="relative flex-1 flex items-center">
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
            maxLength={14} // (XXX) XXX-XXXX
            className={`w-full px-3.5 py-2.5 pr-10 bg-slate-50/60 border rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all text-xs sm:text-sm ${
              showInvalidError
                ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/30'
                : isCompleteAndValid
                ? 'border-emerald-300 focus:ring-emerald-400'
                : 'border-slate-200 focus:ring-indigo-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
          />

          {/* Action & Status Icons */}
          <div className="absolute right-2.5 flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                title="Clear number"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {isCompleteAndValid && (
              <span title="Valid US phone number">
                <Check className="h-4 w-4 text-emerald-500" />
              </span>
            )}
            {showInvalidError && (
              <span title="Incomplete or invalid US number">
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {showValidationHint && showInvalidError && (
        <p className="text-rose-500 text-[10px] font-semibold mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 inline shrink-0" />
          {error || 'Please enter a valid 10-digit US phone number, e.g. (512) 555-0100'}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
