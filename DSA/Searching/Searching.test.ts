import { describe, it, expect } from 'vitest';
import { LinearSearch } from './LinearSearch';
import { BinarySearch } from './BinarySearch';

describe('Searching Algorithms', () => {
  const unsorted = [5, 3, 8, 1, 9];
  const sorted = [1, 3, 5, 8, 9];

  it('should find index using LinearSearch', () => {
    const idx = LinearSearch.run(unsorted, 8);
    expect(idx).toBe(2);

    const missingIdx = LinearSearch.run(unsorted, 10);
    expect(missingIdx).toBe(-1);
  });

  it('should find index using BinarySearch', () => {
    const idx = BinarySearch.run(sorted, 8, (a, b) => a - b);
    expect(idx).toBe(3);

    const missingIdx = BinarySearch.run(sorted, 10, (a, b) => a - b);
    expect(missingIdx).toBe(-1);
  });
});
