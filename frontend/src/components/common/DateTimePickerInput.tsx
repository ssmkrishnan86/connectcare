import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight, X, AlertCircle, Check } from 'lucide-react';
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

/**
 * Robust date parser supporting standard formats:
 * - "Sep 14, 2026 09:00 AM", "September 14, 2026 10:30 PM"
 * - "2026-09-14 09:00 AM", "2026-09-14T09:00"
 * - "09/14/2026 09:00 AM", "14/09/2026 09:00 AM"
 * - "2026-09-14"
 */
export const parseDateTime = (value?: string | null): Date | null => {
  if (!value || typeof value !== 'string' || !value.trim()) return null;
  const trimmed = value.trim();

  // Try direct Date parse
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;

  // Try dd/mm/yyyy or dd-mm-yyyy with optional time
  const dmyMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    let hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const ampm = dmyMatch[6]?.toUpperCase();

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const d = new Date(year, month, day, hour, minute);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
  }

  // Try yyyy-mm-dd or mm/dd/yyyy with optional time
  const ymdMatch = trimmed.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    let hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
    const minute = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    const ampm = ymdMatch[6]?.toUpperCase();

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const d = new Date(year, month, day, hour, minute);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
  }

  return null;
};

export const validateDateTimeString = (
  value?: string | null,
  options?: { required?: boolean; minDate?: string; maxDate?: string }
): { isValid: boolean; error?: string } => {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    if (options?.required) {
      return { isValid: false, error: 'Date & Time is required.' };
    }
    return { isValid: true };
  }

  const parsed = parseDateTime(trimmed);
  if (!parsed || isNaN(parsed.getTime())) {
    return { isValid: false, error: 'Please enter a valid date & time.' };
  }

  if (options?.minDate) {
    const minParsed = parseDateTime(options.minDate);
    if (minParsed) {
      const parsedDateOnly = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      const minDateOnly = new Date(minParsed.getFullYear(), minParsed.getMonth(), minParsed.getDate());
      if (parsedDateOnly < minDateOnly) {
        return { isValid: false, error: `Date cannot be in the past (${options.minDate} or later).` };
      }
    }
  }

  if (options?.maxDate) {
    const maxParsed = parseDateTime(options.maxDate);
    if (maxParsed) {
      const parsedDateOnly = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      const maxDateOnly = new Date(maxParsed.getFullYear(), maxParsed.getMonth(), maxParsed.getDate());
      if (parsedDateOnly > maxDateOnly) {
        return { isValid: false, error: `Date cannot be after ${options.maxDate}.` };
      }
    }
  }

  return { isValid: true };
};

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
  const [internalError, setInternalError] = useState<string>('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Min bounds calculation
  const minParsed = minDate ? parseDateTime(minDate) : null;
  const minYear = minParsed ? minParsed.getFullYear() : null;
  const minMonth = minParsed ? minParsed.getMonth() : null;
  const minDayISO = minParsed
    ? `${minParsed.getFullYear()}-${String(minParsed.getMonth() + 1).padStart(2, '0')}-${String(minParsed.getDate()).padStart(2, '0')}`
    : null;

  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number; width: number; maxHeight: number }>({
    top: 0,
    left: 0,
    width: 320,
    maxHeight: 420,
  });

  // Sync with incoming value
  useEffect(() => {
    setInputValue(value || '');
    if (value) {
      setInternalError('');
    }
  }, [value]);

  // Calendar View State
  const [viewYear, setViewYear] = useState(() => {
    const today = new Date();
    const currentY = today.getFullYear();
    if (minYear !== null && currentY < minYear) return minYear;
    return currentY;
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    const currentM = today.getMonth();
    const currentY = today.getFullYear();
    if (minYear !== null && minMonth !== null && currentY === minYear && currentM < minMonth) return minMonth;
    return currentM;
  });
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00 AM'); // 30-min slot

  // Calculate placement dynamically for fixed portal inside window
  const updatePlacement = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const popoverWidth = Math.min(320, viewportWidth - 24);
      let left = rect.left;
      if (left + popoverWidth > viewportWidth - 12) {
        left = Math.max(12, viewportWidth - popoverWidth - 12);
      }
      if (left < 12) left = 12;

      let top = 0;
      let maxH = 420;
      if (spaceBelow < 340 && spaceAbove > spaceBelow) {
        maxH = Math.max(220, Math.min(spaceAbove - 16, 440));
        top = Math.max(10, rect.top - maxH - 6);
      } else {
        top = rect.bottom + 6;
        maxH = Math.max(220, Math.min(spaceBelow - 16, 440));
      }

      setPopoverCoords({ top, left, width: popoverWidth, maxHeight: maxH });
    }
  }, []);

  // Parse incoming value on popover open
  useEffect(() => {
    if (isOpen) {
      updatePlacement();

      if (value) {
        try {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            let y = d.getFullYear();
            let m = d.getMonth();
            if (minYear !== null && y < minYear) {
              y = minYear;
              m = minMonth ?? 0;
            } else if (minYear !== null && minMonth !== null && y === minYear && m < minMonth) {
              m = minMonth;
            }
            setViewYear(y);
            setViewMonth(m);
            const yyyy = y;
            const mm = String(m + 1).padStart(2, '0');
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
      } else {
        const today = new Date();
        let y = today.getFullYear();
        let m = today.getMonth();
        if (minYear !== null && y < minYear) {
          y = minYear;
          m = minMonth ?? 0;
        } else if (minYear !== null && minMonth !== null && y === minYear && m < minMonth) {
          m = minMonth;
        }
        setViewYear(y);
        setViewMonth(m);
        const yyyy = y;
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }
    }
  }, [isOpen, value, updatePlacement, minYear, minMonth]);

  // Handle window resize and scroll
  useEffect(() => {
    if (isOpen) {
      const handleReposition = () => updatePlacement();
      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);
      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isOpen, updatePlacement]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    if (internalError) {
      const res = validateDateTimeString(raw, { required, minDate, maxDate });
      if (res.isValid) {
        setInternalError('');
      }
    }
    onChange?.(raw);
  };

  const handleInputBlur = () => {
    if (inputValue) {
      const res = validateDateTimeString(inputValue, { required, minDate, maxDate });
      if (!res.isValid) {
        setInternalError(res.error || 'Please enter a valid date & time.');
      } else {
        setInternalError('');
      }
    } else if (required) {
      setInternalError('Date & Time is required.');
    } else {
      setInternalError('');
    }
    onBlur?.();
  };

  const handleApply = (isoDate?: string, slot?: string) => {
    const dateStr = isoDate || selectedDate || new Date().toISOString().split('T')[0];
    const timeVal = slot || selectedTimeSlot || '09:00 AM';

    const formattedDate = formatDate(dateStr);
    const result = `${formattedDate} ${timeVal}`;
    setInputValue(result);
    setInternalError('');
    onChange?.(result);
    setIsOpen(false);
  };

  const handleSelectDay = (dayISO: string) => {
    setSelectedDate(dayISO);
    const formattedDate = formatDate(dayISO);
    const result = `${formattedDate} ${selectedTimeSlot}`;
    setInputValue(result);
    setInternalError('');
    onChange?.(result);
  };

  const handleTimeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlot = e.target.value;
    setSelectedTimeSlot(newSlot);
    const dateStr = selectedDate || new Date().toISOString().split('T')[0];
    const formattedDate = formatDate(dateStr);
    const result = `${formattedDate} ${newSlot}`;
    setInputValue(result);
    setInternalError('');
    onChange?.(result);
  };

  const handleQuickPreset = (preset: 'today10' | 'today2' | 'tomorrow9' | 'tomorrow2') => {
    let target = new Date();
    let slot = '10:00 AM';

    if (preset === 'today10') {
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
    setInternalError('');

    handleApply(iso, slot);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedDate('');
    setInternalError(required ? 'Date & Time is required.' : '');
    onChange?.('');
    setIsOpen(false);
  };

  const canGoPrevMonth = () => {
    if (minYear === null || minMonth === null) return true;
    if (viewYear < minYear) return false;
    if (viewYear === minYear && viewMonth <= minMonth) return false;
    return true;
  };

  const prevMonth = () => {
    if (!canGoPrevMonth()) return;
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

  // Year options: when minYear is specified, hide all years strictly prior to minYear completely!
  const currentYear = new Date().getFullYear();
  const startYear = minYear !== null ? Math.max(minYear, currentYear) : currentYear - 5;
  const endYear = currentYear + 10;
  const yearsList: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    yearsList.push(y);
  }

  // Month options: when viewing minYear, hide past months completely!
  const visibleMonths = months
    .map((m, idx) => ({ name: m, idx }))
    .filter(({ idx }) => {
      if (minYear !== null && viewYear === minYear && minMonth !== null) {
        return idx >= minMonth;
      }
      return true;
    });

  const effectiveError = error || internalError;
  const hasError = Boolean(effectiveError);

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
          onClick={() => !isOpen && !disabled && setIsOpen(true)}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full px-3.5 py-2.5 pr-14 bg-slate-50/60 border rounded-xl font-semibold text-slate-900 focus:outline-none transition-all text-xs sm:text-sm ${
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
                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300'
                : hasError
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
            }`}
            title="Open Date & Time Picker"
          >
            <Calendar className="h-3.5 w-3.5" />
            <Clock className="h-3 w-3 opacity-80" />
          </button>
        </div>
      </div>

      {/* Inline Validation Error Message */}
      {hasError && (
        <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>{effectiveError}</span>
        </p>
      )}

      {/* Interactive DateTime Popover (Mounted via Portal so it never clips or overflows outside window) */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: `${popoverCoords.top}px`,
            left: `${popoverCoords.left}px`,
            width: `${popoverCoords.width}px`,
            maxHeight: `${popoverCoords.maxHeight}px`,
            zIndex: 999999,
          }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 font-sans animate-in fade-in zoom-in-95 duration-100 overflow-y-auto overscroll-contain"
        >
          {/* Month & Year Header with Quick Navigation */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              disabled={!canGoPrevMonth()}
              onClick={prevMonth}
              className={`p-1 rounded-lg text-slate-500 transition-colors ${
                !canGoPrevMonth()
                  ? 'opacity-20 cursor-not-allowed pointer-events-none'
                  : 'hover:bg-slate-100 hover:text-slate-800 cursor-pointer'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {visibleMonths.map((m) => (
                  <option key={m.name} value={m.idx}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => {
                  const yr = parseInt(e.target.value, 10);
                  setViewYear(yr);
                  if (minYear !== null && minMonth !== null && yr === minYear && viewMonth < minMonth) {
                    setViewMonth(minMonth);
                  }
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="Next Month"
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
              <div key={`empty-${idx}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const mmStr = String(viewMonth + 1).padStart(2, '0');
              const ddStr = String(day).padStart(2, '0');
              const dayISO = `${viewYear}-${mmStr}-${ddStr}`;
              const isSelected = selectedDate === dayISO;
              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === day;
              const isPastDate = Boolean(minDayISO && dayISO < minDayISO);
              const isAfterMax = Boolean(maxDate && dayISO > maxDate);

              // Note 2: "Past dates still displaying as disabled - past date and year section should be hidden completely, not just disabled"
              if (isPastDate) {
                return <div key={`empty-past-${day}`} className="h-7 w-7" />;
              }

              const isDisabledDate = isAfterMax;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={Boolean(isDisabledDate)}
                  onClick={() => handleSelectDay(dayISO)}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
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

          {/* Time Selector Bar (30-min intervals) */}
          <div className="bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs shrink-0">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>Time:</span>
            </div>
            <select
              value={selectedTimeSlot}
              onChange={handleTimeSelect}
              className="flex-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {TIME_SLOTS_30_MIN.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickPreset('today10')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-bold text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 10 AM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('today2')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-bold text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Today 2:30 PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('tomorrow9')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md font-bold text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
            >
              Tmrw 9 AM
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleApply()}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DateTimePickerInput;