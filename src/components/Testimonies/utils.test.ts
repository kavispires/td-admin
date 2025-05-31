import { describe, expect, it } from 'vitest';
import type { TestimonyAnswersValues } from '../../pages/Testimonies/useTestimoniesResource';
import normalizeValues from './utils';

describe('normalizeValues', () => {
  it('should keep single values unchanged', () => {
    expect(normalizeValues([0] as TestimonyAnswersValues[])).toEqual([0]);
    expect(normalizeValues([1] as TestimonyAnswersValues[])).toEqual([1]);
    expect(normalizeValues([3] as TestimonyAnswersValues[])).toEqual([3]);
    expect(normalizeValues([4] as TestimonyAnswersValues[])).toEqual([4]);
    expect(normalizeValues([-4] as TestimonyAnswersValues[])).toEqual([-4]);
  });

  it('should normalize four consecutive 0s into one -4', () => {
    expect(normalizeValues([0, 0, 0, 0] as TestimonyAnswersValues[])).toEqual([-4]);
    expect(normalizeValues([0, 0, 0, 0, 0] as TestimonyAnswersValues[])).toEqual([-4, 0]);
    expect(normalizeValues([0, 0, 0, 0, 0, 0, 0, 0] as TestimonyAnswersValues[])).toEqual([-4, -4]);
  });

  it('should normalize four consecutive 1s into one 4', () => {
    expect(normalizeValues([1, 1, 1, 1] as TestimonyAnswersValues[])).toEqual([4]);
    expect(normalizeValues([1, 1, 1, 1, 1] as TestimonyAnswersValues[])).toEqual([1, 4]);
    expect(normalizeValues([1, 1, 1, 1, 1, 1, 1, 1] as TestimonyAnswersValues[])).toEqual([4, 4]);
  });

  it('should handle mixed values correctly', () => {
    expect(normalizeValues([0, 1, 0, 1] as TestimonyAnswersValues[])).toEqual([0, 0, 1, 1]);
    expect(normalizeValues([0, 0, 0, 1, 1, 1, 1] as TestimonyAnswersValues[])).toEqual([0, 0, 0, 4]);
    expect(normalizeValues([1, 1, 1, 1, 0, 0, 0, 0] as TestimonyAnswersValues[])).toEqual([-4, 4]);
  });

  it('should preserve values different than 0 and 1', () => {
    expect(normalizeValues([-4, 0, 0, 0, 0, 1, 1, 1, 1, 3] as TestimonyAnswersValues[])).toEqual([
      -4, -4, 3, 4,
    ]);
    expect(normalizeValues([4, -4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 3] as TestimonyAnswersValues[])).toEqual([
      -4, -4, 0, 3, 4, 4,
    ]);
  });

  it('should handle complex sequences', () => {
    expect(
      normalizeValues([0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, -3] as TestimonyAnswersValues[]),
    ).toEqual([-4, -4, -3, 0, 1, 4]);

    expect(
      normalizeValues([1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0] as TestimonyAnswersValues[]),
    ).toEqual([-4, -4, 4, 4]);
  });

  it('should handle empty arrays', () => {
    expect(normalizeValues([] as TestimonyAnswersValues[])).toEqual([]);
  });
});
