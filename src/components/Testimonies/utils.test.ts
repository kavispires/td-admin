import { describe, expect, it } from 'vitest';
import type { TestimonyAnswersValues } from '../../pages/Libraries/Testimonies/useTestimoniesResource';
import normalizeValues from './utils';

describe('normalizeValues', () => {
  it('should keep 32 and -32 untouched, one entry per occurrence', () => {
    const input: TestimonyAnswersValues[] = [32, 32, -32, 1];
    const result = normalizeValues(input);
    expect(result).toEqual([32, 32, -32, 1]);
  });

  it('should reserve exactly one 4 and one -4 as markers and fold the rest into the sum', () => {
    const input: TestimonyAnswersValues[] = [4, -4];
    const result = normalizeValues(input);
    expect(result).toEqual([4, -4]);
  });

  it('should fold extra 4s beyond the reserved marker into the positive sum', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 4, 4, 4];
    const result = normalizeValues(input);
    expect(result).toEqual([4, 10]);
  });

  it('should sum plain votes with no key values present', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 1];
    const result = normalizeValues(input);
    expect(result).toEqual([5]);
  });

  it('should sum plain negative votes with no key values present', () => {
    const input: TestimonyAnswersValues[] = [-1, -1, -1, -1, -1, -1, -1, -1];
    const result = normalizeValues(input);
    expect(result).toEqual([-8]);
  });

  it('should handle mixed positive and negative votes', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1];
    const result = normalizeValues(input);
    expect(result).toEqual([-3, 8]);
  });

  it('should split a sum that exactly collides with the 4 marker into 3 + padding 1', () => {
    // Four 1s sum to 4, colliding with the reserved "4" marker
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 4];
    const result = normalizeValues(input);
    expect(result).toEqual([4, 1, 3]);
  });

  it('should split a sum that exactly collides with the 32 marker into 31 + padding 1', () => {
    const input: TestimonyAnswersValues[] = [-1, 4, 4, 4, 4, 4, 4, 4, 8];
    const result = normalizeValues(input);
    expect(result).toEqual([4, -1, 1, 31]);
  });

  it('should split a collision on both polarities independently', () => {
    const input: TestimonyAnswersValues[] = [-4, -4, -7, -12, -1, 4, 4, 4, 4, 4, 4, 4, 8];
    const result = normalizeValues(input);
    expect(result).toEqual([4, -4, -24, 1, 31]);
  });

  it('should not cap when the diff between remaining sums is <= 13', () => {
    const input: TestimonyAnswersValues[] = Array(20).fill(1).concat(Array(10).fill(-1));
    const result = normalizeValues(input);
    expect(result).toEqual([-10, 20]);
  });

  it('should lossily cap (no padding) when the diff exceeds 13 and there is no exact collision', () => {
    const input: TestimonyAnswersValues[] = Array(45).fill(1).concat([-1]);
    const result = normalizeValues(input);
    expect(result).toEqual([-1, 31]);
  });

  it('should treat legacy 0 values the same as -1', () => {
    const input: TestimonyAnswersValues[] = [0, 0, 1, 1];
    const result = normalizeValues(input);
    expect(result).toEqual([-2, 2]);
  });

  it('should handle empty array', () => {
    const input: TestimonyAnswersValues[] = [];
    const result = normalizeValues(input);
    expect(result).toEqual([]);
  });

  it('should order key markers first (32, -32, 4, -4), then sums ascending', () => {
    const input: TestimonyAnswersValues[] = [32, -32, 4, -4, 1, 1, 1, 1, 1, -1, -1];
    const result = normalizeValues(input);
    expect(result).toEqual([32, -32, 4, -4, -2, 5]);
  });
});
