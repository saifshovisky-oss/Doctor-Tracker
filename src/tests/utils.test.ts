import { describe, expect, it } from 'vitest';
import { conditionTone, errorMessage, formatDate, initials, toQueryString } from '@/lib/utils';

describe('Utilities', () => {
  it('builds initials', () => {
    expect(initials('Dr. Sarah Chen')).toBe('DS');
  });

  it('formats dates in UTC consistently', () => {
    expect(formatDate('2024-01-15T10:00:00Z')).toBe('Jan 15, 2024');
    expect(formatDate(null)).toBe('—');
  });

  it('serializes query params without empty values', () => {
    expect(toQueryString({ page: 2, search: '', condition: 'Flu', doctorId: undefined })).toBe('?page=2&condition=Flu');
  });

  it('maps conditions to restrained badge tones', () => {
    expect(conditionTone('Diabetes')).toBe('rose');
    expect(conditionTone('Routine checkup')).toBe('teal');
  });

  it('normalizes error messages', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
    expect(errorMessage(null)).toContain('Something went wrong');
  });
});
