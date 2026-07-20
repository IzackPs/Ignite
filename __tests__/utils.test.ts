import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatPercent, formatNumber } from '../src/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1234.56).replace(/\s/g, ' '); // Replace non-breaking space
      // Note: Intl formatting could use different spaces
      expect(result).toContain('1.234,56');
      expect(result).toContain('R$');
    });

    it('should return R$ 0,00 for invalid inputs', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
      expect(formatCurrency(undefined as any)).toBe('R$ 0,00');
      expect(formatCurrency(null as any)).toBe('R$ 0,00');
    });
  });

  describe('formatPercent', () => {
    it('should format percent correctly', () => {
      expect(formatPercent(12.345)).toBe('12,35%');
      expect(formatPercent(10, 1)).toBe('10,0%');
    });

    it('should return 0,00% for invalid inputs', () => {
      expect(formatPercent(NaN)).toBe('0,00%');
      expect(formatPercent(undefined as any)).toBe('0,00%');
      expect(formatPercent(null as any)).toBe('0,00%');
    });
  });

  describe('formatNumber', () => {
    it('should format number correctly', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56');
      expect(formatNumber(10.5, 0)).toBe('11');
    });

    it('should return 0 for invalid inputs', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(undefined as any)).toBe('0');
      expect(formatNumber(null as any)).toBe('0');
    });
  });
});
