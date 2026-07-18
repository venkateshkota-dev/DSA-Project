/**
 * Algorithm/Data Structure Name: Linear Search
 * 
 * Purpose:
 * Scans each element in a collection sequentially until a match is found or the end of the collection is reached.
 * 
 * CineBook Use Case:
 * Used to search through unsorted collections of movies, such as dynamic suggestions or personalized recommendation sets.
 * 
 * Real-world Applications:
 * - Small dataset lookups
 * - Searching unsorted files or lines of text
 * - Finding items in linked lists
 * 
 * Time Complexity:
 * - Worst Case: O(N)
 * - Best Case: O(1)
 * - Average Case: O(N)
 * 
 * Space Complexity:
 * - O(1) auxiliary space.
 * 
 * Advantages:
 * - Simplicity; no sorting requirement.
 * - Works on any data collection format (e.g. lists, stream).
 * 
 * Limitations:
 * - Extremely inefficient for large datasets.
 * 
 * Pseudocode:
 * function LinearSearch(array, target):
 *   for i from 0 to array.length - 1:
 *     if array[i] == target: return i
 *   return -1
 */

export interface SearchStep {
  currentIndex: number;
  left?: number;
  right?: number;
  mid?: number;
  array: any[];
  explanation: string;
  foundIndex: number;
}

export class LinearSearch {
  /**
   * Standard linear search execution.
   */
  static run<T>(array: T[], target: T, compare: (a: T, b: T) => boolean = (a, b) => a === b): number {
    for (let i = 0; i < array.length; i++) {
      if (compare(array[i], target)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Generator-based linear search execution for visualization.
   */
  static *runGenerator<T>(
    array: T[], 
    target: T, 
    compare: (a: T, b: T) => boolean = (a, b) => a === b
  ): Generator<SearchStep, number, unknown> {
    
    yield {
      currentIndex: -1,
      array,
      explanation: `Starting linear search. Looking for target ${JSON.stringify(target)} in an array of size ${array.length}.`,
      foundIndex: -1
    };

    for (let i = 0; i < array.length; i++) {
      const match = compare(array[i], target);
      yield {
        currentIndex: i,
        array,
        explanation: `Comparing element at index ${i} (${JSON.stringify(array[i])}) with target.`,
        foundIndex: match ? i : -1
      };

      if (match) {
        yield {
          currentIndex: i,
          array,
          explanation: `Match found at index ${i}!`,
          foundIndex: i
        };
        return i;
      }
    }

    yield {
      currentIndex: array.length,
      array,
      explanation: `Scanned all elements. Target not found in the collection.`,
      foundIndex: -1
    };
    return -1;
  }
}
