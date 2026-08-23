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

export function getInitials(name?: string | null, defaultInitials = 'U'): string {
  if (!name || !name.trim()) return defaultInitials;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
