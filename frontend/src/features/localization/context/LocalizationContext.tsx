import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import { normalizeToISODate } from '../../../lib/utils';

export type DateFormatType =
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'YYYY-MM-DD'
  | 'MMM DD, YYYY'
  | string;

export type TimeFormatType = '12 Hour' | '24 Hour' | string;

export interface LocalizationConfig {
  dateFormat: string;
  shortDateFormat?: string;
  timeFormat: string;
  defaultLanguage: string;
  fallbackLanguage?: string;
  weekStartsOn: string;
  timeZone: string;
  previewRegion?: string;
  currency?: string;
  weightUnit?: string;
  heightUnit?: string;
  temperatureUnit?: string;
}

export const DEFAULT_LOCALIZATION: LocalizationConfig = {
  dateFormat: 'MM/DD/YYYY',
  shortDateFormat: 'MM/DD/YYYY',
  timeFormat: '12 Hour',
  defaultLanguage: 'English (United States)',
  weekStartsOn: 'Sunday',
  timeZone: '(UTC-05:00) Eastern Time (US & Canada)',
  previewRegion: 'United States',
  currency: 'USD ($)',
  weightUnit: 'Pounds (lbs)',
  heightUnit: 'Feet / Inches',
  temperatureUnit: 'Fahrenheit (°F)',
};

interface LocalizationContextType {
  config: LocalizationConfig;
  dateFormat: string;
  timeFormat: string;
  updateLocalization: (newConfig: Partial<LocalizationConfig>) => void;
  formatDate: (value?: string | Date | null, customFormat?: string) => string;
  formatDateTime: (value?: string | Date | null) => string;
  formatTime: (value?: string | Date | null) => string;
  parseToISODate: (displayDate?: string) => string;
  formatISOToDisplay: (isoDate?: string) => string;
  parseToISODateStrict: (displayDate?: string, targetFormat?: string) => DateValidationResult;
  validateDateInput: (
    displayDate?: string,
    targetFormat?: string,
    minDate?: string,
    maxDate?: string
  ) => DateValidationResult;
  getDateFormatExample: (formatStr?: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper to normalize format string e.g. "MM/DD/YYYY (05/19/2025)" -> "MM/DD/YYYY"
export function normalizeDateFormat(formatStr?: string): string {
  if (!formatStr) return 'MM/DD/YYYY';
  const clean = formatStr.split('(')[0].trim().toUpperCase();
  if (clean.includes('DD/MM/YYYY')) return 'DD/MM/YYYY';
  if (clean.includes('YYYY-MM-DD')) return 'YYYY-MM-DD';
  if (clean.includes('MMM DD, YYYY') || clean.includes('MMM')) return 'MMM DD, YYYY';
  if (clean.includes('MM/DD/YYYY')) return 'MM/DD/YYYY';
  return clean || 'MM/DD/YYYY';
}

export function getDateFormatExample(formatStr?: string): string {
  const norm = normalizeDateFormat(formatStr);
  switch (norm) {
    case 'DD/MM/YYYY':
      return '19/05/2025';
    case 'YYYY-MM-DD':
      return '2025-05-19';
    case 'MMM DD, YYYY':
      return 'May 19, 2025';
    case 'MM/DD/YYYY':
    default:
      return '05/19/2025';
  }
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2150 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const MONTH_NAMES_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export interface DateValidationResult {
  isValid: boolean;
  isoDate: string;
  error?: string;
}

export function parseToISODateStrict(
  displayDate?: string,
  targetFormat?: string
): DateValidationResult {
  if (!displayDate || !displayDate.trim()) {
    return { isValid: true, isoDate: '' };
  }

  const trimmed = displayDate.trim();
  const format = normalizeDateFormat(targetFormat);
  const example = getDateFormatExample(format);

  if (format === 'MM/DD/YYYY') {
    const match = trimmed.match(/^(\d{1,2})([/.-])(\d{1,2})\2(\d{4})$/);
    if (!match) {
      return {
        isValid: false,
        isoDate: '',
        error: `Invalid date format. Expected MM/DD/YYYY (e.g. ${example})`,
      };
    }
    const m = parseInt(match[1], 10);
    const d = parseInt(match[3], 10);
    const y = parseInt(match[4], 10);
    if (!isValidCalendarDate(y, m, d)) {
      return {
        isValid: false,
        isoDate: '',
        error: 'Invalid calendar date. Please enter a valid date.',
      };
    }
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { isValid: true, isoDate: iso };
  }

  if (format === 'DD/MM/YYYY') {
    const match = trimmed.match(/^(\d{1,2})([/.-])(\d{1,2})\2(\d{4})$/);
    if (!match) {
      return {
        isValid: false,
        isoDate: '',
        error: `Invalid date format. Expected DD/MM/YYYY (e.g. ${example})`,
      };
    }
    const d = parseInt(match[1], 10);
    const m = parseInt(match[3], 10);
    const y = parseInt(match[4], 10);
    if (!isValidCalendarDate(y, m, d)) {
      return {
        isValid: false,
        isoDate: '',
        error: 'Invalid calendar date. Please enter a valid date.',
      };
    }
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { isValid: true, isoDate: iso };
  }

  if (format === 'YYYY-MM-DD') {
    const match = trimmed.match(/^(\d{4})([/.-])(\d{1,2})\2(\d{1,2})$/);
    if (!match) {
      return {
        isValid: false,
        isoDate: '',
        error: `Invalid date format. Expected YYYY-MM-DD (e.g. ${example})`,
      };
    }
    const y = parseInt(match[1], 10);
    const m = parseInt(match[3], 10);
    const d = parseInt(match[4], 10);
    if (!isValidCalendarDate(y, m, d)) {
      return {
        isValid: false,
        isoDate: '',
        error: 'Invalid calendar date. Please enter a valid date.',
      };
    }
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { isValid: true, isoDate: iso };
  }

  if (format === 'MMM DD, YYYY') {
    const match = trimmed.match(/^([a-zA-Z]{3,9})[.,]?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
    if (!match) {
      return {
        isValid: false,
        isoDate: '',
        error: `Invalid date format. Expected MMM DD, YYYY (e.g. ${example})`,
      };
    }
    const monthKey = match[1].toLowerCase();
    const m = MONTH_NAMES_MAP[monthKey];
    if (!m) {
      return {
        isValid: false,
        isoDate: '',
        error: 'Invalid month name. Expected Jan, Feb, Mar, etc.',
      };
    }
    const d = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    if (!isValidCalendarDate(y, m, d)) {
      return {
        isValid: false,
        isoDate: '',
        error: 'Invalid calendar date. Please enter a valid date.',
      };
    }
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { isValid: true, isoDate: iso };
  }

  // Generic fallback with normalizeToISODate
  const normalized = normalizeToISODate(trimmed);
  if (normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return { isValid: true, isoDate: normalized };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return {
      isValid: false,
      isoDate: '',
      error: `Invalid date format. Expected ${format} (e.g. ${example})`,
    };
  }
  const iso = parsed.toISOString().split('T')[0];
  return { isValid: true, isoDate: iso };
}

export function validateDateInput(
  displayDate?: string,
  targetFormat?: string,
  minDate?: string,
  maxDate?: string,
  formatDateFn?: (val: string) => string
): DateValidationResult {
  const result = parseToISODateStrict(displayDate, targetFormat);
  if (!result.isValid) {
    return result;
  }

  if (result.isoDate) {
    const fmt = formatDateFn || ((val: string) => val);
    if (maxDate && result.isoDate > maxDate) {
      const todayISO = new Date().toISOString().split('T')[0];
      if (maxDate === todayISO) {
        return { isValid: false, isoDate: '', error: 'Date cannot be in the future.' };
      }
      return { isValid: false, isoDate: '', error: `Date cannot be after ${fmt(maxDate)}.` };
    }
    if (minDate && result.isoDate < minDate) {
      return { isValid: false, isoDate: '', error: `Date cannot be before ${fmt(minDate)}.` };
    }
  }

  return result;
}

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<LocalizationConfig>(() => {
    try {
      const saved = localStorage.getItem('user_localization_settings');
      if (saved) {
        return { ...DEFAULT_LOCALIZATION, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read cached localization settings', e);
    }
    return DEFAULT_LOCALIZATION;
  });

  // Load from backend on initialization
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const [genRes, locRes] = await Promise.allSettled([
          api.getSettingsGeneral(),
          api.getSettingsLocalization(),
        ]);

        const genData = genRes.status === 'fulfilled' ? genRes.value : null;
        const locData = locRes.status === 'fulfilled' ? locRes.value : null;

        const merged: LocalizationConfig = {
          dateFormat: normalizeDateFormat(locData?.dateFormat || genData?.dateFormat || config.dateFormat),
          shortDateFormat: locData?.shortDateFormat || genData?.shortDateFormat || config.shortDateFormat,
          timeFormat: locData?.timeFormat || genData?.timeFormat || config.timeFormat,
          defaultLanguage: locData?.defaultLanguage || genData?.defaultLanguage || config.defaultLanguage,
          fallbackLanguage: locData?.fallbackLanguage || config.fallbackLanguage,
          weekStartsOn: locData?.weekStartsOn || genData?.weekStartsOn || config.weekStartsOn,
          timeZone: locData?.timeZone || config.timeZone,
          previewRegion: locData?.previewRegion || config.previewRegion,
          currency: genData?.currency || config.currency,
          weightUnit: genData?.weightUnit || config.weightUnit,
          heightUnit: genData?.heightUnit || config.heightUnit,
          temperatureUnit: genData?.temperatureUnit || config.temperatureUnit,
        };

        if (isMounted) {
          setConfig(merged);
          localStorage.setItem('user_localization_settings', JSON.stringify(merged));
        }
      } catch (err) {
        console.warn('Failed to load remote localization settings:', err);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateLocalization = useCallback((newConfig: Partial<LocalizationConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        ...newConfig,
        dateFormat: newConfig.dateFormat ? normalizeDateFormat(newConfig.dateFormat) : prev.dateFormat,
      };
      try {
        localStorage.setItem('user_localization_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save localization settings to localStorage', e);
      }
      return updated;
    });
  }, []);

  const activeDateFormat = normalizeDateFormat(config.dateFormat);
  const is12Hour = config.timeFormat.includes('12 Hour') || config.timeFormat.includes('12') || !config.timeFormat.includes('24');

  // Format Date to Display according to setting
  const formatDate = useCallback(
    (value?: string | Date | null, customFormat?: string): string => {
      if (!value) return '';

      const targetFormat = normalizeDateFormat(customFormat || activeDateFormat);

      let dateObj: Date;
      if (value instanceof Date) {
        dateObj = value;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        // Check if matching YYYY-MM-DD
        const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (ymd) {
          const [, y, m, d] = ymd;
          const mm = m.padStart(2, '0');
          const dd = d.padStart(2, '0');
          if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
          if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
          if (targetFormat === 'MMM DD, YYYY') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = months[parseInt(mm, 10) - 1] || mm;
            return `${monthName} ${dd}, ${y}`;
          }
          return `${mm}/${dd}/${y}`;
        }

        // Check if matching MM/DD/YYYY
        const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (mdy) {
          const [, m, d, y] = mdy;
          const mm = m.padStart(2, '0');
          const dd = d.padStart(2, '0');
          if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
          if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
          if (targetFormat === 'MMM DD, YYYY') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = months[parseInt(mm, 10) - 1] || mm;
            return `${monthName} ${dd}, ${y}`;
          }
          return `${mm}/${dd}/${y}`;
        }

        dateObj = new Date(value);
      } else {
        return '';
      }

      if (Number.isNaN(dateObj.getTime())) return typeof value === 'string' ? value : '';

      const y = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');

      if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
      if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
      if (targetFormat === 'MMM DD, YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[dateObj.getMonth()]} ${dd}, ${y}`;
      }
      return `${mm}/${dd}/${y}`;
    },
    [activeDateFormat]
  );

  // Format Time string
  const formatTime = useCallback(
    (value?: string | Date | null): string => {
      if (!value) return '';
      const dateObj = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(dateObj.getTime())) return typeof value === 'string' ? value : '';

      let hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');

      if (is12Hour) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      }
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    },
    [is12Hour]
  );

  // Format Date and Time combined
  const formatDateTime = useCallback(
    (value?: string | Date | null): string => {
      if (!value) return '';
      const d = formatDate(value);
      const t = formatTime(value);
      return d && t ? `${d} ${t}` : d || t;
    },
    [formatDate, formatTime]
  );

  // Parse display format (e.g. MM/DD/YYYY or DD/MM/YYYY) to standard ISO YYYY-MM-DD
  const parseToISODate = useCallback(
    (displayDate?: string): string => {
      if (!displayDate) return '';
      const trimmed = displayDate.trim();

      // Already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

      const parts = trimmed.split(/[/.-]/);
      if (parts.length !== 3) return '';

      const [p1, p2, p3] = parts;
      if (p3.length === 4) {
        if (activeDateFormat === 'DD/MM/YYYY') {
          // p1=day, p2=month, p3=year
          return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
        }
        // default MM/DD/YYYY: p1=month, p2=day, p3=year
        return `${p3}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`;
      }
      return '';
    },
    [activeDateFormat]
  );

  // Format standard ISO YYYY-MM-DD into active Display Format
  const formatISOToDisplay = useCallback(
    (isoDate?: string): string => {
      return formatDate(isoDate);
    },
    [formatDate]
  );

  const handleValidateDateInput = useCallback(
    (displayDate?: string, targetFormat?: string, minDate?: string, maxDate?: string) => {
      return validateDateInput(displayDate, targetFormat || activeDateFormat, minDate, maxDate, formatDate);
    },
    [activeDateFormat, formatDate]
  );

  const handleParseToISODateStrict = useCallback(
    (displayDate?: string, targetFormat?: string) => {
      return parseToISODateStrict(displayDate, targetFormat || activeDateFormat);
    },
    [activeDateFormat]
  );

  return (
    <LocalizationContext.Provider
      value={{
        config,
        dateFormat: activeDateFormat,
        timeFormat: config.timeFormat,
        updateLocalization,
        formatDate,
        formatDateTime,
        formatTime,
        parseToISODate,
        formatISOToDisplay,
        parseToISODateStrict: handleParseToISODateStrict,
        validateDateInput: handleValidateDateInput,
        getDateFormatExample,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      config: DEFAULT_LOCALIZATION,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12 Hour',
      updateLocalization: () => {},
      formatDate: (val?: any) => (val ? String(val) : ''),
      formatDateTime: (val?: any) => (val ? String(val) : ''),
      formatTime: (val?: any) => (val ? String(val) : ''),
      parseToISODate: (val?: any) => (val ? String(val) : ''),
      formatISOToDisplay: (val?: any) => (val ? String(val) : ''),
      parseToISODateStrict: (val?: any, fmt?: string) => parseToISODateStrict(val, fmt),
      validateDateInput: (val?: any, fmt?: string, min?: string, max?: string) => validateDateInput(val, fmt, min, max),
      getDateFormatExample,
    };
  }
  return context;
};
