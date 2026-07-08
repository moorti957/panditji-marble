// admin/src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// Tailwind CSS Utilities
// ============================================================

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * 
 * @example
 * ```ts
 * cn('px-4 py-2', 'bg-gold', { 'text-white': true })
 * // => 'px-4 py-2 bg-gold text-white'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// Currency & Price Formatting
// ============================================================

/**
 * Format a number as Indian Rupees (₹)
 * 
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 * 
 * @example
 * ```ts
 * formatPrice(2499) // '₹2,499'
 * formatPrice(1000000) // '₹10,00,000'
 * ```
 */
export function formatPrice(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format a number with Indian number system (lakhs, crores)
 * 
 * @example
 * ```ts
 * formatIndianNumber(150000) // '1.5L'
 * formatIndianNumber(25000000) // '2.5Cr'
 * formatIndianNumber(5000) // '5,000'
 * ```
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`;
  }
  return num.toLocaleString('en-IN');
}

// ============================================================
// Date & Time Formatting
// ============================================================

/**
 * Format a date with the given format
 * 
 * @example
 * ```ts
 * formatDate(new Date()) // 'Jan 15, 2024'
 * formatDate('2024-01-15', 'full') // 'January 15, 2024'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  switch (format) {
    case 'long':
      options.month = 'long';
      break;
    case 'full':
      options.month = 'long';
      options.weekday = 'long';
      break;
    case 'short':
      options.month = 'numeric';
      break;
    default:
      break;
  }

  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Format a date with time
 * 
 * @example
 * ```ts
 * formatDateTime(new Date()) // 'Jan 15, 2024, 2:30 PM'
 * ```
 */
export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format a date as a relative time (e.g., '2 days ago')
 * 
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 86400000 * 2)) // '2 days ago'
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}m ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  if (diffSec > 10) return `${diffSec}s ago`;
  return 'Just now';
}

// ============================================================
// Text Utilities
// ============================================================

/**
 * Truncate text to a specified length with ellipsis
 * 
 * @example
 * ```ts
 * truncate('This is a long text', 10) // 'This is a...'
 * ```
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * Generate a URL-friendly slug from a string
 * 
 * @example
 * ```ts
 * slugify('Ganesh Murti - Premium!') // 'ganesh-murti-premium'
 * ```
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Get initials from a name
 * 
 * @example
 * ```ts
 * getInitials('Devotee Sharma') // 'DS'
 * getInitials('Radha Krishna') // 'RK'
 * ```
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Capitalize the first letter of each word
 * 
 * @example
 * ```ts
 * capitalizeWords('ganesh murti') // 'Ganesh Murti'
 * ```
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get the plural form of a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}

// ============================================================
// Validation Utilities
// ============================================================

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if a string is a valid Indian phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid Indian pincode
 */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ============================================================
// Object & Array Utilities
// ============================================================

/**
 * Deeply clone an object or array
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object
 * 
 * @example
 * ```ts
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 * 
 * @example
 * ```ts
 * omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Group an array by a key
 * 
 * @example
 * ```ts
 * groupBy([{ category: 'A' }, { category: 'B' }, { category: 'A' }], 'category')
 * // { A: [...], B: [...] }
 * ```
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk an array into smaller arrays of a given size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================
// Async Utilities
// ============================================================

/**
 * Debounce a function
 * 
 * @example
 * ```ts
 * const debouncedSearch = debounce((query) => searchApi(query), 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 * 
 * @example
 * ```ts
 * const throttledScroll = throttle(() => handleScroll(), 100);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep for a given number of milliseconds
 * 
 * @example
 * ```ts
 * await sleep(1000); // Pause for 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Browser / Environment Utilities
// ============================================================

/**
 * Check if code is running in the browser
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Check if code is running in a development environment
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if code is running in a production environment
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get the base URL of the application
 */
export function getBaseUrl(): string {
  if (isBrowser) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
  return value || fallback;
}

// ============================================================
// Clipboard & Download Utilities
// ============================================================

/**
 * Copy text to clipboard
 * 
 * @example
 * ```ts
 * await copyToClipboard('Hello World');
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Download a file from a URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}

// ============================================================
// File Utilities
// ============================================================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if a file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

// ============================================================
// Random / ID Generation
// ============================================================

/**
 * Generate a unique ID using crypto
 */
export function generateId(): string {
  if (isBrowser && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Generate a random string of a given length
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================
// Color Utilities
// ============================================================

/**
 * Generate a random hex color
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Lighten or darken a hex color
 */
export function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ============================================================
// Export all
// ============================================================

const utils = {
  cn,
  formatPrice,
  formatIndianNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncate,
  slugify,
  getInitials,
  capitalizeWords,
  capitalizeFirstLetter,
  pluralize,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidPincode,
  isEmpty,
  deepClone,
  pick,
  omit,
  groupBy,
  chunkArray,
  debounce,
  throttle,
  sleep,
  isBrowser,
  isDevelopment,
  isProduction,
  getBaseUrl,
  getEnv,
  copyToClipboard,
  downloadFile,
  downloadBlob,
  getFileExtension,
  formatFileSize,
  isImageFile,
  isVideoFile,
  generateId,
  generateRandomString,
  randomColor,
  adjustColor,
};

export default utils;