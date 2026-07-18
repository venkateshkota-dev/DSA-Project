/**
 * Algorithm/Data Structure Name: Merge Sort
 * 
 * Purpose:
 * A divide-and-conquer sorting algorithm that divides the input array into two halves, 
 * calls itself recursively for the two halves, and then merges the two sorted halves.
 * 
 * CineBook Use Case:
 * Sorts movies based on user reviews/ratings. Since it is a stable sort, it preserves the 
 * relative order of movies with identical ratings (useful for maintaining sub-sorting criteria like title alphabetically).
 * 
 * Real-world Applications:
 * - External sorting (sorting datasets too large to fit in RAM)
 * - E-commerce product sorting filters
 * - E-mail inbox classification lists
 * 
 * Time Complexity:
 * - Worst Case: O(N log N)
 * - Best Case: O(N log N)
 * - Average Case: O(N log N)
 * 
 * Space Complexity:
 * - O(N) auxiliary memory for creating temporary split sub-arrays.
 * 
 * Advantages:
 * - Stable sort (preserves duplicate items order).
 * - Guaranteed O(N log N) worst-case speed.
 * 
 * Limitations:
 * - High memory overhead of O(N) compared to in-place sorts (QuickSort, HeapSort).
 * 
 * Pseudocode:
 * function MergeSort(arr):
 *   if arr.length <= 1: return arr
 *   mid = arr.length / 2
 *   left = MergeSort(arr[0..mid-1])
 *   right = MergeSort(arr[mid..end])
 *   return merge(left, right)
 */

export interface SortStep {
  array: any[];
  comparingIndices: number[];
  swappingIndices: number[];
  explanation: string;
  leftSubarray?: any[];
  rightSubarray?: any[];
}

export class MergeSort {
  /**
   * Standard Merge Sort.
   */
  static run<T>(array: T[], compare: (a: T, b: T) => number): T[] {
    if (array.length <= 1) return [...array];
    const mid = Math.floor(array.length / 2);
    const left = MergeSort.run(array.slice(0, mid), compare);
    const right = MergeSort.run(array.slice(mid), compare);
    return MergeSort.merge(left, right, compare);
  }

  private static merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
    const result: T[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (compare(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  /**
   * Generator-based Merge Sort for step-by-step visualization.
   * Yields step details as it splits and merges in-place inside a tracker array.
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
      explanation: `Starting Merge Sort on array: [${arr.map(x => JSON.stringify(x)).join(', ')}].`
    };

    yield* MergeSort.sortHelperGenerator(arr, 0, arr.length - 1, compare);

    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      explanation: `Sorting complete! Final sorted array: [${arr.map(x => JSON.stringify(x)).join(', ')}].`
    };

    return arr;
  }

  private static *sortHelperGenerator<T>(
    arr: T[], 
    start: number, 
    end: number, 
    compare: (a: T, b: T) => number
  ): Generator<SortStep, void, unknown> {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);
    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      explanation: `Splitting array range [${start} to ${end}] at index ${mid}. Left: [${start}..${mid}], Right: [${mid + 1}..${end}].`,
      leftSubarray: arr.slice(start, mid + 1),
      rightSubarray: arr.slice(mid + 1, end + 1)
    };

    yield* MergeSort.sortHelperGenerator(arr, start, mid, compare);
    yield* MergeSort.sortHelperGenerator(arr, mid + 1, end, compare);
    yield* MergeSort.mergeGenerator(arr, start, mid, end, compare);
  }

  private static *mergeGenerator<T>(
    arr: T[], 
    start: number, 
    mid: number, 
    end: number, 
    compare: (a: T, b: T) => number
  ): Generator<SortStep, void, unknown> {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    
    yield {
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      explanation: `Merging left sorted block [${left.map(x => JSON.stringify(x)).join(', ')}] and right sorted block [${right.map(x => JSON.stringify(x)).join(', ')}] back into indices ${start}..${end}.`
    };

    let i = 0, j = 0, k = start;
    while (i < left.length && j < right.length) {
      const idxL = start + i;
      const idxR = mid + 1 + j;

      yield {
        array: [...arr],
        comparingIndices: [idxL, idxR],
        swappingIndices: [],
        explanation: `Comparing elements: Left[${i}] (${JSON.stringify(left[i])}) with Right[${j}] (${JSON.stringify(right[j])}).`
      };

      if (compare(left[i], right[j]) <= 0) {
        arr[k] = left[i];
        yield {
          array: [...arr],
          comparingIndices: [],
          swappingIndices: [k],
          explanation: `Placed Left[${i}] (${JSON.stringify(left[i])}) into index ${k}.`
        };
        i++;
      } else {
        arr[k] = right[j];
        yield {
          array: [...arr],
          comparingIndices: [],
          swappingIndices: [k],
          explanation: `Placed Right[${j}] (${JSON.stringify(right[j])}) into index ${k}.`
        };
        j++;
      }
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      yield {
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [k],
        explanation: `Copied remaining Left element ${JSON.stringify(left[i])} into index ${k}.`
      };
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      yield {
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [k],
        explanation: `Copied remaining Right element ${JSON.stringify(right[j])} into index ${k}.`
      };
      j++;
      k++;
    }
  }
}
