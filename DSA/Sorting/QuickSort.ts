/**
 * Algorithm/Data Structure Name: Quick Sort
 * 
 * Purpose:
 * An in-place divide-and-conquer sorting algorithm. It selects a 'pivot' element and partitions 
 * the array around the pivot, placing smaller elements to the left and larger elements to the right.
 * 
 * CineBook Use Case:
 * Sorts showtimes and available seats by ticket price in ascending order.
 * 
 * Real-world Applications:
 * - Systems programming sorting routines (e.g. glibc's qsort, Java's dual-pivot QuickSort)
 * - Numeric data analytics engines
 * 
 * Time Complexity:
 * - Worst Case: O(N^2) (occurs when partitioning is highly unbalanced, e.g. already sorted array with extreme pivots)
 * - Best Case: O(N log N)
 * - Average Case: O(N log N)
 * 
 * Space Complexity:
 * - O(log N) average auxiliary stack memory for recursion.
 * 
 * Advantages:
 * - Extremely fast in practice; excellent cache performance.
 * - In-place sorting; requires minimal extra memory.
 * 
 * Limitations:
 * - Unstable sort (does not preserve relative duplicate ordering).
 * - Degenerates to O(N^2) without random pivot choices or safety fallbacks (like IntroSort).
 * 
 * Pseudocode:
 * function QuickSort(arr, low, high):
 *   if low < high:
 *     pi = partition(arr, low, high)
 *     QuickSort(arr, low, pi - 1)
 *     QuickSort(arr, pi + 1, high)
 */

import { SortStep } from './MergeSort';

export class QuickSort {
  /**
   * Standard Quick Sort.
   */
  static run<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    const arr = [...array];
    QuickSort.sortHelper(arr, 0, arr.length - 1, compare);
    return arr;
  }

  private static sortHelper<T>(arr: T[], low: number, high: number, compare: (a: T, b: T) => number): void {
    if (low < high) {
      const pi = QuickSort.partition(arr, low, high, compare);
      QuickSort.sortHelper(arr, low, pi - 1, compare);
      QuickSort.sortHelper(arr, pi + 1, high, compare);
    }
  }

  private static partition<T>(arr: T[], low: number, high: number, compare: (a: T, b: T) => number): number {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (compare(arr[j], pivot) < 0) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
  }

  /**
   * Generator-based Quick Sort for visualization.
   */
  static *runGenerator<T>(
    array: T[], 
    compare: (a: T, b: T) => number
  ): Generator<SortStep, T[], unknown> {
    const arr = [...array];

    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      explanation: `Starting Quick Sort on array: [${arr.map(x => JSON.stringify(x)).join(', ')}].`
    };

    yield* QuickSort.sortHelperGenerator(arr, 0, arr.length - 1, compare);

    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      explanation: `Quick Sort completed! Sorted array: [${arr.map(x => JSON.stringify(x)).join(', ')}].`
    };

    return arr;
  }

  private static *sortHelperGenerator<T>(
    arr: T[], 
    low: number, 
    high: number, 
    compare: (a: T, b: T) => number
  ): Generator<SortStep, void, unknown> {
    if (low < high) {
      const partitionGen = QuickSort.partitionGenerator(arr, low, high, compare);
      let step = partitionGen.next();
      let pi = low;
      while (!step.done) {
        yield step.value;
        step = partitionGen.next();
      }
      pi = (step as IteratorReturnResult<number>).value;

      yield* QuickSort.sortHelperGenerator(arr, low, pi - 1, compare);
      yield* QuickSort.sortHelperGenerator(arr, pi + 1, high, compare);
    }
  }

  private static *partitionGenerator<T>(
    arr: T[], 
    low: number, 
    high: number, 
    compare: (a: T, b: T) => number
  ): Generator<SortStep, number, unknown> {
    const pivot = arr[high];
    let i = low - 1;

    yield {
      array: [...arr],
      comparingIndices: [high],
      swappingIndices: [],
      explanation: `Selected pivot element: ${JSON.stringify(pivot)} at index ${high}. Partitioning range [${low}..${high}].`
    };

    for (let j = low; j < high; j++) {
      yield {
        array: [...arr],
        comparingIndices: [j, high],
        swappingIndices: [],
        explanation: `Comparing element at index ${j} (${JSON.stringify(arr[j])}) with pivot ${JSON.stringify(pivot)}.`
      };

      if (compare(arr[j], pivot) < 0) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        yield {
          array: [...arr],
          comparingIndices: [],
          swappingIndices: [i, j],
          explanation: `Element is smaller than pivot. Incremented smaller element index to ${i} and swapped index ${i} (${JSON.stringify(arr[i])}) with index ${j} (${JSON.stringify(arr[j])}).`
        };
      }
    }

    // Place pivot in correct spot
    const pivotDest = i + 1;
    const temp = arr[pivotDest];
    arr[pivotDest] = arr[high];
    arr[high] = temp;

    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [pivotDest, high],
      explanation: `Placing pivot ${JSON.stringify(pivot)} into its final sorted position at index ${pivotDest}. Swapped indices ${pivotDest} and ${high}.`
    };

    return pivotDest;
  }
}
