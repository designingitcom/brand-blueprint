import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should combine class names', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      'btn',
      isActive && 'btn-active',
      isDisabled && 'btn-disabled'
    );

    expect(result).toBe('btn btn-active');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('p-4 bg-blue-500', 'p-2 bg-red-500');
    expect(result).toBe('p-2 bg-red-500');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('should handle arrays of classes', () => {
    const classes = ['flex', 'items-center'];
    const result = cn(classes, 'justify-center');
    expect(result).toBe('flex items-center justify-center');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
