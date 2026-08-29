import React, { useState, useEffect, useRef, useId } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { useLocalization } from '@/features/localization/context/LocalizationContext';

export interface DateTimePickerInputProps {
  value?: string | null; // e.g. "Aug 28, 2026 10:00 AM", "2026-08-28 10:00", "08/28/2026 10:00 AM" or ISO
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  error?: string;
  onBlur?: () => void;
}

export const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  value = '',
  onChange,
  placeholder = 'e.g. Aug 28, 2026 10:00 AM',
  className = '',
  disabled = false,
  required = false,
  id,
  name,
  error,
  onBlur,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const { formatDate } = useLocalization();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync with incoming value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Calendar View State
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedHour, setSelectedHour] = useState<string>('10');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>('AM');

  // Parse incoming value on popover open
  useEffect(() => {
    if (isOpen && value) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setSelectedDate(`${yyyy}-${mm}-${dd}`);

          let h = d.getHours();
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          setSelectedHour(String(h).padStart(2, '0'));
          setSelectedMinute(String(d.getMinutes()).padStart(2, '0'));
          setSelectedAmPm(ampm);
        }
      } catch {}
    }
  }, [isOpen, value]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    onChange?.(raw);
  };

  const handleApply = (isoDate?: string, hr?: string, min?: string, ampm?: 'AM' | 'PM') => {
    const dateStr = isoDate || selectedDate || new Date().toISOString().split('T')[0];
    const hourVal = hr || selectedHour;
    const minVal = min || selectedMinute;
    const ampmVal = ampm || selectedAmPm;

    const formattedDate = formatDate(dateStr);
    const result = `${formattedDate} ${hourVal}:${minVal} ${ampmVal}`;
    setInputValue(result);
    onChange?.(result);
    setIsOpen(false);
  };

  const handleQuickPreset = (preset: 'now' | 'today10' | 'today2' | 'tomorrow9' | 'tomorrow2') => {
    const now = new Date();
    let target = new Date();

    if (preset === 'now') {
      target = now;
    } else if (preset === 'today10') {
      target.setHours(10, 0, 0, 0);
    } else if (preset === 'today2') {
      target.setHours(14, 0, 0, 0);
    } else if (preset === 'tomorrow9') {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (preset === 'tomorrow2') {
      target.setDate(target.getDate() + 1);
      target.setHours(14, 0, 0, 0);
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;

    let h = target.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const hr = String(h).padStart(2, '0');
    const min = String(target.getMinutes()).padStart(2, '0');

    setSelectedDate(iso);
    setSelectedHour(hr);
    setSelectedMinute(min);
    setSelectedAmPm(ampm);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    handleApply(iso, hr, min, ampm);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedDate('');
    onChange?.('');
    setIsOpen(false);
  };

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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const hasError = Boolean(error);

  return (
    <div className="relative w-full" ref={popoverRef}>
      <div className="relative flex items-center">
        <input
          id={inputId}
          name={name}
          type="text"
          disabled={disabled}
          required={required}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={onBlur}
          className={`w-full px-3.5 py-2.5 pr-12 bg-slate-50/60 border rounded-xl font-semibold text-slate-900 focus:outline-none transition-all text-xs sm:text-sm ${
            hasError
              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400 focus:ring-2 focus:ring-rose-500'
              : className.includes('border-')
              ? 'focus:ring-2 focus:ring-indigo-500 focus:bg-white'
              : 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
              title="Clear date & time"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors cursor-pointer flex items-center gap-0.5"
            title="Open Date & Time Picker"
          >
            <Calendar className={`h-4 w-4 ${hasError ? 'text-rose-500' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Inline Validation Error Message */}
      {hasError && (
        <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </p>
      )}

      {/* Interactive DateTime Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 font-sans animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 border-b border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickPreset('today10')}
              className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 10 AM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('today2')}
              className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 2 PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('tomorrow9')}
              className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Tomorrow 9 AM
            </button>
          </div>

          {/* Month / Year header */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-bold text-slate-800">
              {months[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
              <span key={idx} className="text-[10px] font-bold text-slate-400">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const mmStr = String(viewMonth + 1).padStart(2, '0');
              const ddStr = String(day).padStart(2, '0');
              const dayISO = `${viewYear}-${mmStr}-${ddStr}`;
              const isSelected = selectedDate === dayISO;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(dayISO)}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>Time:</span>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedAmPm}
                onChange={(e) => setSelectedAmPm(e.target.value as 'AM' | 'PM')}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleApply()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePickerInput;