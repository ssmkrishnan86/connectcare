import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateMMDDYYYY(value?: string | Date | null): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

export function formatDateTimeMMDDYYYY(value?: string | Date | null): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${month}/${day}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
}
