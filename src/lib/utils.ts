import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const avatarColors = [
  'bg-teal-50 text-teal-700',
  'bg-sky-50 text-sky-700',
  'bg-indigo-50 text-indigo-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return avatarColors[hash % avatarColors.length]!;
}

export function formatDate(value?: string | Date | null, withTime = false): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function conditionTone(condition: string): 'teal' | 'blue' | 'amber' | 'rose' | 'slate' {
  const value = condition.toLowerCase();
  if (/diabet|hypertens|cardiac|heart/.test(value)) return 'rose';
  if (/asthma|respir|bronch/.test(value)) return 'blue';
  if (/fever|flu|cold|migraine/.test(value)) return 'amber';
  if (/routine|check|wellness/.test(value)) return 'teal';
  return 'slate';
}

export function toQueryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') search.set(key, String(value));
  });
  const result = search.toString();
  return result ? `?${result}` : '';
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong. Please try again.';
}
