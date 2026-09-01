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
  minDate?: string; // e.g. "2026-09-01"
  maxDate?: string;
  onBlur?: () => void;
}

export const TIME_SLOTS_30_MIN: string[] = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const parseTimeSlot = (input: string): string => {
  if (!input) return '09:00 AM';
  // Match 12-hour format e.g. "09:00 AM" or "9:30 PM"
  const match12 = input.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase() as 'AM' | 'PM';
    const roundedMin = m < 15 ? '00' : m < 45 ? '30' : '00';
    if (m >= 45) {
      h = h === 12 ? 1 : h + 1;
    }
    const hStr = String(h).padStart(2, '0');
    const slot = `${hStr}:${roundedMin} ${ampm}`;
    if (TIME_SLOTS_30_MIN.includes(slot)) return slot;
  }
  // Match 24-hour format e.g. "14:30"
  const match24 = input.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const min = parseInt(match24[2], 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let h = hour % 12 || 12;
    const roundedMin = min < 15 ? '00' : min < 45 ? '30' : '00';
    if (min >= 45) {
      h = h === 12 ? 1 : h + 1;
    }
    const hStr = String(h).padStart(2, '0');
    const slot = `${hStr}:${roundedMin} ${ampm}`;
    if (TIME_SLOTS_30_MIN.includes(slot)) return slot;
  }
  return '09:00 AM';
};

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
  minDate,
  maxDate,
  onBlur,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const { formatDate } = useLocalization();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [popoverPlacement, setPopoverPlacement] = useState<'bottom' | 'top'>('bottom');
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with incoming value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Calendar View State
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00 AM'); // 30-min slot

  // Parse incoming value on popover open
  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 380 && rect.top > 380) {
          setPopoverPlacement('top');
        } else {
          setPopoverPlacement('bottom');
        }
      }

      if (value) {
        try {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            setSelectedDate(`${yyyy}-${mm}-${dd}`);
            setSelectedTimeSlot(parseTimeSlot(value));
          } else {
            const slot = parseTimeSlot(value);
            setSelectedTimeSlot(slot);
          }
        } catch {
          setSelectedTimeSlot(parseTimeSlot(value));
        }
      }
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

  const handleApply = (isoDate?: string, slot?: string) => {
    const dateStr = isoDate || selectedDate || new Date().toISOString().split('T')[0];
    const timeVal = slot || selectedTimeSlot || '09:00 AM';

    const formattedDate = formatDate(dateStr);
    const result = `${formattedDate} ${timeVal}`;
    setInputValue(result);
    onChange?.(result);
    setIsOpen(false);
  };

  const handleSelectDay = (dayISO: string) => {
    setSelectedDate(dayISO);
    const formattedDate = formatDate(dayISO);
    const result = `${formattedDate} ${selectedTimeSlot}`;
    setInputValue(result);
    onChange?.(result);
  };

  const handleTimeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlot = e.target.value;
    setSelectedTimeSlot(newSlot);
    const dateStr = selectedDate || new Date().toISOString().split('T')[0];
    const formattedDate = formatDate(dateStr);
    const result = `${formattedDate} ${newSlot}`;
    setInputValue(result);
    onChange?.(result);
  };

  const handleQuickPreset = (preset: 'now' | 'today10' | 'today2' | 'tomorrow9' | 'tomorrow2') => {
    const now = new Date();
    let target = new Date();
    let slot = '09:00 AM';

    if (preset === 'now') {
      target = now;
      slot = parseTimeSlot(now.toTimeString());
    } else if (preset === 'today10') {
      target.setHours(10, 0, 0, 0);
      slot = '10:00 AM';
    } else if (preset === 'today2') {
      target.setHours(14, 30, 0, 0);
      slot = '02:30 PM';
    } else if (preset === 'tomorrow9') {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
      slot = '09:00 AM';
    } else if (preset === 'tomorrow2') {
      target.setDate(target.getDate() + 1);
      target.setHours(14, 30, 0, 0);
      slot = '02:30 PM';
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;

    setSelectedDate(iso);
    setSelectedTimeSlot(slot);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    handleApply(iso, slot);
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
    <div className="relative w-full" ref={containerRef}>
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

        <div className="absolute right-2 flex items-center gap-1">
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
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              isOpen
                ? 'bg-indigo-600 text-white border-indigo-600'
                : hasError
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
            }`}
            title="Open Date & Time Picker"
          >
            <Calendar className="h-3.5 w-3.5" />
            <Clock className="h-3 w-3 opacity-70" />
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
        <div
          ref={popoverRef}
          className={`absolute left-0 ${
            popoverPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-1.5'
          } z-[100] w-84 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 font-sans animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto`}
        >
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 border-b border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickPreset('today10')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 10:00 AM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('today2')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 02:30 PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('tomorrow9')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Tomorrow 09:00 AM
            </button>
          </div>

          {/* Time Dropdown (30 mins gap) - PROMINENTLY AT TOP */}
          <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 mb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={`${inputId}-time-slot`} className="flex items-center gap-1.5 text-indigo-950 font-black text-xs">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>Select Time (30 mins gap):</span>
              </label>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                30 mins gap
              </span>
            </div>

            <select
              id={`${inputId}-time-slot`}
              value={selectedTimeSlot}
              onChange={handleTimeSelect}
              className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {TIME_SLOTS_30_MIN.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Month / Year header */}
          <div className="flex items-center justify-between gap-1 pb-1.5 mb-1 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-black text-slate-800">
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
          <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-6.5 w-6.5" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const mmStr = String(viewMonth + 1).padStart(2, '0');
              const ddStr = String(day).padStart(2, '0');
              const dayISO = `${viewYear}-${mmStr}-${ddStr}`;
              const isSelected = selectedDate === dayISO;
              const isDisabledDate = (minDate && dayISO < minDate) || (maxDate && dayISO > maxDate);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={Boolean(isDisabledDate)}
                  onClick={() => handleSelectDay(dayISO)}
                  className={`h-6.5 w-6.5 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30'
                      : isDisabledDate
                      ? 'text-slate-300 opacity-40 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
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