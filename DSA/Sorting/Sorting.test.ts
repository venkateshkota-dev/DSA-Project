import { describe, it, expect } from 'vitest';
import { MergeSort } from './MergeSort';
import { QuickSort } from './QuickSort';
import { HeapSort } from './HeapSort';

describe('Sorting Algorithms', () => {
  const getUnsorted = () => [9, 3, 7, 5, 1, 8, 2, 6, 4];
  const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const comp = (a: number, b: number) => a - b;

  it('should sort using MergeSort', () => {
    const arr = getUnsorted();
    const result = MergeSort.run(arr, comp);
    expect(result).toEqual(sorted);
  });

  it('should sort using QuickSort', () => {
    const arr = getUnsorted();
    const result = QuickSort.run(arr, comp);
    expect(result).toEqual(sorted);
  });

  it('should sort using HeapSort', () => {
    const arr = getUnsorted();
    const result = HeapSort.run(arr, comp);
    expect(result).toEqual(sorted);
  });
});
