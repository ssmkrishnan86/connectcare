import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActiveDateFormat(): string {
  try {
    const saved = localStorage.getItem('user_localization_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dateFormat) {
        const clean = parsed.dateFormat.split('(')[0].trim().toUpperCase();
        if (clean.includes('DD/MM/YYYY')) return 'DD/MM/YYYY';
        if (clean.includes('YYYY-MM-DD')) return 'YYYY-MM-DD';
        if (clean.includes('MMM DD, YYYY') || clean.includes('MMM')) return 'MMM DD, YYYY';
        if (clean.includes('MM/DD/YYYY')) return 'MM/DD/YYYY';
      }
    }
  } catch {}
  return 'MM/DD/YYYY';
}

const MONTH_NAMES_DICT: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

export function normalizeToISODate(value?: string | Date | null): string {
  if (!value) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(value).trim();
  if (!str) return '';

  // 1. Standard ISO YYYY-MM-DD or ISO with timestamp (e.g. 1985-12-15 or 1985-12-15T00:00:00.000Z or 1985-12-15 00:00:00)
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 2. Day Month Year name format e.g. "15 Dec, 1985" or "15 Dec 1985" or "15-Dec-1985"
  const dayMonthYearMatch = str.match(/^(\d{1,2})[\s,/-]+([a-zA-Z]{3,9})[\s,/-]+(\d{4})/);
  if (dayMonthYearMatch) {
    const [, d, monthStr, y] = dayMonthYearMatch;
    const m = MONTH_NAMES_DICT[monthStr.toLowerCase()];
    if (m) {
      return `${y}-${m}-${d.padStart(2, '0')}`;
    }
  }

  // 3. Month name first e.g. "Dec 15, 1985" or "December 15 1985"
  const monthDayYearMatch = str.match(/^([a-zA-Z]{3,9})[\s,/-]+(\d{1,2})[\s,/-]+(\d{4})/);
  if (monthDayYearMatch) {
    const [, monthStr, d, y] = monthDayYearMatch;
    const m = MONTH_NAMES_DICT[monthStr.toLowerCase()];
    if (m) {
      return `${y}-${m}-${d.padStart(2, '0')}`;
    }
  }

  // 4. Numeric formats with separators (/, -, ., or spaces): e.g. "15 12, 1985" or "12/15/1985" or "15/12/1985" or "12-15-1985"
  const numericMatch = str.match(/^(\d{1,2})[\s/.-]+(\d{1,2})[\s/.,-]+(\d{4})/);
  if (numericMatch) {
    const [, n1, n2, y] = numericMatch;
    const num1 = parseInt(n1, 10);
    const num2 = parseInt(n2, 10);

    // If first number is > 12, it must be day (DD/MM/YYYY)
    if (num1 > 12 && num2 <= 12) {
      return `${y}-${String(num2).padStart(2, '0')}-${String(num1).padStart(2, '0')}`;
    }
    // If second number is > 12, it must be day (MM/DD/YYYY)
    if (num2 > 12 && num1 <= 12) {
      return `${y}-${String(num1).padStart(2, '0')}-${String(num2).padStart(2, '0')}`;
    }
    // Otherwise check active localized format or default to MM/DD/YYYY
    const activeFormat = getActiveDateFormat();
    if (activeFormat === 'DD/MM/YYYY') {
      return `${y}-${String(num2).padStart(2, '0')}-${String(num1).padStart(2, '0')}`;
    }
    return `${y}-${String(num1).padStart(2, '0')}-${String(num2).padStart(2, '0')}`;
  }

  // 5. Native Date fallback
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return str;
}

export function formatDateMMDDYYYY(value?: string | Date | null): string {
  if (!value) return '';
  const targetFormat = getActiveDateFormat();

  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Check if it matches YYYY-MM-DD or YYYY-MM-DDTHH:...
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch;
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
      if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
      if (targetFormat === 'MMM DD, YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(mm, 10) - 1] || mm} ${dd}, ${y}`;
      }
      return `${mm}/${dd}/${y}`;
    }
    // Check if it already matches MM/DD/YYYY
    const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (mdyMatch) {
      const [, m, d, y] = mdyMatch;
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
      if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
      if (targetFormat === 'MMM DD, YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(mm, 10) - 1] || mm} ${dd}, ${y}`;
      }
      return `${mm}/${dd}/${y}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';

  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();

  if (targetFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${y}`;
  if (targetFormat === 'YYYY-MM-DD') return `${y}-${mm}-${dd}`;
  if (targetFormat === 'MMM DD, YYYY') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${dd}, ${y}`;
  }
  return `${mm}/${dd}/${y}`;
}

export function formatDateTimeMMDDYYYY(value?: string | Date | null): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';

  const formattedDate = formatDateMMDDYYYY(date);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${formattedDate} ${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
}


export function formatCurrencyUSD(amount?: number | string | null): string {
  if (amount === undefined || amount === null) return '$0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatUSPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Real-time phone input masking helper for (XXX) XXX-XXXX
export function formatUSPhoneInput(value: string): string {
  if (!value) return '';
  // Extract digits
  let digits = value.replace(/\D/g, '');

  // If user included leading US country code '1', strip it for 10-digit format
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }

  // Limit to max 10 digits
  digits = digits.slice(0, 10);

  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Validates 10-digit US phone number
export function isValidUSPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    const main10 = digits.slice(1);
    // Area code and exchange code cannot start with 0 or 1 in US NANP
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(main10);
  }
  if (digits.length === 10) {
    // Area code and exchange code cannot start with 0 or 1 in US NANP
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
  }
  return false;
}

// Standard RFC 5322 compliant Email validator
export function isValidEmail(email?: string | null): boolean {
  if (!email || !email.trim()) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

// Comprehensive list of standard family, legal, and caregiver relationships
export interface RelationshipCategory {
  category: string;
  options: string[];
}

export const RELATIONSHIP_CATEGORIES: RelationshipCategory[] = [
  {
    category: 'Immediate Family',
    options: ['Spouse', 'Mother', 'Father', 'Parent', 'Son', 'Daughter', 'Child', 'Brother', 'Sister', 'Sibling'],
  },
  {
    category: 'Extended Family',
    options: ['Grandmother', 'Grandfather', 'Grandparent', 'Grandson', 'Granddaughter', 'Grandchild', 'Aunt', 'Uncle', 'Cousin', 'Niece', 'Nephew', 'Relative'],
  },
  {
    category: 'Legal & Caregiving',
    options: ['Legal Guardian', 'Caregiver', 'Power of Attorney (POA)', 'Healthcare Proxy', 'Legal Representative'],
  },
  {
    category: 'Personal & Other',
    options: ['Domestic Partner', 'Friend', 'Neighbor', 'Emergency Contact', 'Other'],
  },
];

export const ALL_RELATIONSHIPS = RELATIONSHIP_CATEGORIES.flatMap((c) => c.options);

export function getInitials(name?: string | null, defaultInitials = 'U'): string {
  if (!name || !name.trim()) return defaultInitials;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

