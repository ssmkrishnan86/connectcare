import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLocalization } from '@/features/localization/context/LocalizationContext';

export interface DatePickerInputProps {
  value?: string | null; // Always standard ISO YYYY-MM-DD or empty
  onChange?: (isoValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: string; // ISO YYYY-MM-DD
  maxDate?: string; // ISO YYYY-MM-DD
  id?: string;
  name?: string;
  onBlur?: () => void;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value = '',
  onChange,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  minDate,
  maxDate,
  id,
  name,
  onBlur,
}) => {
  const { dateFormat, formatDate, parseToISODate } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal display value when external ISO `value` or `dateFormat` changes
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const formatted = formatDate(value);
      setInputValue(formatted);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, dateFormat, formatDate]);

  // Calendar Picker Internal View State (Year & Month)
  const [viewYear, setViewYear] = useState(() => {
    if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return parseInt(value.substring(0, 4), 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return parseInt(value.substring(5, 7), 10) - 1;
    }
    return new Date().getMonth();
  });

  // When value changes, update calendar view if valid
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const y = parseInt(value.substring(0, 4), 10);
      const m = parseInt(value.substring(5, 7), 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m);
      }
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activePlaceholder = placeholder || dateFormat || 'MM/DD/YYYY';

  // Handle direct manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Try parsing if complete date entered (e.g. 10 chars MM/DD/YYYY or YYYY-MM-DD)
    if (raw.length === 10) {
      const parsedISO = parseToISODate(raw);
      if (parsedISO && /^\d{4}-\d{2}-\d{2}$/.test(parsedISO)) {
        if (maxDate && parsedISO > maxDate) return;
        if (minDate && parsedISO < minDate) return;
        const testDate = new Date(parsedISO);
        if (!isNaN(testDate.getTime())) {
          onChange?.(parsedISO);
        }
      }
    } else if (raw === '') {
      onChange?.('');
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange?.('');
    } else {
      const parsedISO = parseToISODate(inputValue);
      if (parsedISO && /^\d{4}-\d{2}-\d{2}$/.test(parsedISO)) {
        if ((maxDate && parsedISO > maxDate) || (minDate && parsedISO < minDate)) {
          if (value) {
            setInputValue(formatDate(value));
          } else {
            setInputValue('');
            onChange?.('');
          }
        } else {
          onChange?.(parsedISO);
          setInputValue(formatDate(parsedISO));
        }
      } else if (value) {
        // revert to last valid value
        setInputValue(formatDate(value));
      } else {
        setInputValue('');
        onChange?.('');
      }
    }
    onBlur?.();
  };

  // Calendar Day Clicked
  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mm}-${dd}`;
    if (maxDate && isoString > maxDate) return;
    if (minDate && isoString < minDate) return;
    onChange?.(isoString);
    setInputValue(formatDate(isoString));
    setIsOpen(false);
  };

  // Calendar Quick Navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const isoString = `${yyyy}-${mm}-${dd}`;
    if (maxDate && isoString > maxDate) return;
    if (minDate && isoString < minDate) return;
    setViewYear(yyyy);
    setViewMonth(today.getMonth());
    onChange?.(isoString);
    setInputValue(formatDate(isoString));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.('');
    setInputValue('');
    setIsOpen(false);
  };

  // Days Calculation for Month Grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Year range generation (bounded by maxDate and minDate if provided)
  const currentYear = new Date().getFullYear();
  const maxYear = maxDate ? parseInt(maxDate.substring(0, 4), 10) : currentYear + 10;
  const minYear = minDate ? parseInt(minDate.substring(0, 4), 10) : 1920;
  const yearsList = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  // Selected date comparison
  const selectedYear = value ? parseInt(value.substring(0, 4), 10) : null;
  const selectedMonth = value ? parseInt(value.substring(5, 7), 10) - 1 : null;
  const selectedDay = value ? parseInt(value.substring(8, 10), 10) : null;

  return (
    <div className="relative w-full" ref={popoverRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          required={required}
          value={inputValue}
          placeholder={activePlaceholder}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full px-3.5 py-2.5 pr-10 bg-slate-50/60 border ${
            className.includes('border-') ? '' : 'border-slate-200'
          } rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs sm:text-sm ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
          } ${className}`}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
            title="Open calendar"
          >
            <CalendarIcon className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 font-sans animate-in fade-in zoom-in-95 duration-100">
          {/* Month & Year Selectors Header */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
              <span key={idx} className="text-[11px] font-bold text-slate-400">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const mmStr = String(viewMonth + 1).padStart(2, '0');
              const ddStr = String(day).padStart(2, '0');
              const dayISO = `${viewYear}-${mmStr}-${ddStr}`;

              const isBeforeMin = minDate ? dayISO < minDate : false;
              const isAfterMax = maxDate ? dayISO > maxDate : false;
              const isDayDisabled = isBeforeMin || isAfterMax;

              const isSelected =
                selectedYear === viewYear &&
                selectedMonth === viewMonth &&
                selectedDay === day;

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDayDisabled}
                  onClick={() => !isDayDisabled && handleSelectDay(day)}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isDayDisabled
                      ? 'opacity-30 cursor-not-allowed text-slate-300'
                      : isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}

          </div>

          {/* Footer with Today / Clear and Format Badge */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {dateFormat}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerInput;
