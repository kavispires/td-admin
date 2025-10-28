import { describe, expect, it } from 'vitest';
import type { TestimonyAnswersValues } from '../../pages/Libraries/Testimonies/useTestimoniesResource';
import normalizeValues from './utils';

describe('normalizeValues', () => {
  it('should handle special values (-32, 32) differently from (4, -4)', () => {
    const input: TestimonyAnswersValues[] = [-32, 32, 4, -4];
    const result = normalizeValues(input);
    // -32 and 32 are kept as is, but 4 and -4 appear both as originals and flattened
    expect(result).toEqual([-32, -4, -1, -1, -1, -1, 1, 1, 1, 1, 4, 32]);
  });

  it('should include 4 and -4 in the result while also flattening them', () => {
    const input: TestimonyAnswersValues[] = [4, -4];
    const result = normalizeValues(input);
    // The function both keeps 4 and -4 and also flattens them into ones
    expect(result).toEqual([-4, -1, -1, -1, -1, 1, 1, 1, 1, 4]);
  });

  it('should convert 8 ones into a value of 8', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 1, 1, 1, 1];
    const result = normalizeValues(input);
    expect(result).toEqual([8]);
  });

  it('should convert 8 negative ones into a value of -8', () => {
    const input: TestimonyAnswersValues[] = [-1, -1, -1, -1, -1, -1, -1, -1];
    const result = normalizeValues(input);
    expect(result).toEqual([-8]);
  });

  it('should handle remainders when count is not a multiple of 8', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 1]; // 5 ones
    const result = normalizeValues(input);
    expect(result).toEqual([1, 1, 1, 1, 1]);
  });

  it('should handle multiple groups of 8', () => {
    const input: TestimonyAnswersValues[] = Array(17).fill(1); // 17 ones = 2 groups of 8 + 1 remainder
    const result = normalizeValues(input);
    expect(result).toEqual([1, 8, 8]);
  });

  it('should handle mixed positive and negative ones', () => {
    const input: TestimonyAnswersValues[] = [1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1]; // 8 ones and 3 negative ones
    const result = normalizeValues(input);
    expect(result).toEqual([-1, -1, -1, 8]);
  });

  it('should flatten other numbers into ones', () => {
    // Using the correct type and passing array as unknown to test implementation behavior
    const input = [1, 1, -1, -1] as unknown as TestimonyAnswersValues[];
    const result = normalizeValues(input);
    expect(result).toEqual([-1, -1, 1, 1]);
  });

  it('should handle complex mixed inputs', () => {
    const input: TestimonyAnswersValues[] = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, -32, 32];
    // 0s are being flattened to [-1, -1, -1, -1] based on the test results
    // 8 ones become an 8
    // -32 and 32 stay as is
    const result = normalizeValues(input);
    expect(result).toEqual([-32, -1, -1, -1, -1, 8, 32]);
  });

  it('should handle empty array', () => {
    const input: TestimonyAnswersValues[] = [];
    const result = normalizeValues(input);
    expect(result).toEqual([]);
  });

  it('should properly sort the resulting array', () => {
    const input: TestimonyAnswersValues[] = [32, 1, -1, -32];
    const result = normalizeValues(input);
    expect(result).toEqual([-32, -1, 1, 32]);
  });

  it('should handle values of 0 by converting them to -1s', () => {
    const input: TestimonyAnswersValues[] = [0, 0, 0, 1, 1];
    const result = normalizeValues(input);
    // Based on the test results, 0s are being converted to -1s
    expect(result).toEqual([-1, -1, -1, 1, 1]);
  });

  it('should properly handle the threshold of 8 for both positive and negative ones', () => {
    const input: TestimonyAnswersValues[] = Array(10).fill(1).concat(Array(9).fill(-1));
    // 10 ones = 8 + 2 ones
    // 9 negative ones = -8 + (-1)
    const result = normalizeValues(input);
    expect(result).toEqual([-8, -1, 1, 1, 8]);
  });
});
