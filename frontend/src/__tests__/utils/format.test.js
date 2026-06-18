import { describe, it, expect } from 'vitest';
import { formatCOP } from '../../utils/format';

describe('formatCOP', () => {
  it('retorna $0 para null/undefined', () => {
    expect(formatCOP(null)).toBe('$0');
    expect(formatCOP(undefined)).toBe('$0');
  });

  it('formatea cero', () => {
    expect(formatCOP(0)).toBe('$0');
  });

  it('formatea enteros en pesos colombianos', () => {
    const result = formatCOP(150000);
    expect(result).toContain('$');
    expect(result).toContain('150');
  });

  it('formatea decimales', () => {
    const result = formatCOP(154700);
    expect(result).toContain('$');
    expect(result).toContain('154');
  });

  it('maneja strings numéricas', () => {
    expect(formatCOP('50000')).toContain('$');
  });

  it('maneja strings no numéricas', () => {
    expect(formatCOP('abc')).toBe('$NaN');
  });
});
