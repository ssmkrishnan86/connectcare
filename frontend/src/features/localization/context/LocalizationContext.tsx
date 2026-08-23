import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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
    };
  }
  return context;
};
