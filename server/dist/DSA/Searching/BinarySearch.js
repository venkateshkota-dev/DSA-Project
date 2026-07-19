"use strict";
/**
 * Algorithm/Data Structure Name: Binary Search
 *
 * Purpose:
 * Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.
 *
 * CineBook Use Case:
 * Searches for specific show times or dates in sorted timelines.
 *
 * Real-world Applications:
 * - Database index lookups
 * - Version control bisect commands (e.g. git bisect)
 * - Library system index lookup
 *
 * Time Complexity:
 * - Worst Case: O(log N)
 * - Best Case: O(1)
 * - Average Case: O(log N)
 *
 * Space Complexity:
 * - O(1) auxiliary space (iterative version).
 *
 * Advantages:
 * - Extremely fast; handles millions of records in under 20-30 comparisons.
 *
 * Limitations:
 * - Requires the collection to be fully sorted.
 * - Array must allow constant-time index access.
 *
 * Pseudocode:
 * function BinarySearch(array, target):
 *   left = 0, right = array.length - 1
 *   while left <= right:
 *     mid = floor((left + right) / 2)
 *     if array[mid] == target: return mid
 *     else if array[mid] < target: left = mid + 1
 *     else: right = mid - 1
 *   return -1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinarySearch = void 0;
class BinarySearch {
    /**
     * Standard binary search execution.
     */
    static run(array, target, compare) {
        let left = 0;
        let right = array.length - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const cmp = compare(array[mid], target);
            if (cmp === 0) {
                return mid;
            }
            else if (cmp < 0) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }
        return -1;
    }
    /**
     * Generator-based binary search execution for visualization.
     */
    static *runGenerator(array, target, compare) {
        let left = 0;
        let right = array.length - 1;
        yield {
            currentIndex: -1,
            left,
            right,
            mid: undefined,
            array,
            explanation: `Starting binary search. Search range: [${left}, ${right}]. Target is ${JSON.stringify(target)}.`,
            foundIndex: -1
        };
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            yield {
                currentIndex: -1,
                left,
                right,
                mid,
                array,
                explanation: `Calculating mid-index: mid = floor((${left} + ${right}) / 2) = ${mid}. Value at mid is ${JSON.stringify(array[mid])}.`,
                foundIndex: -1
            };
            const cmp = compare(array[mid], target);
            if (cmp === 0) {
                yield {
                    currentIndex: -1,
                    left,
                    right,
                    mid,
                    array,
                    explanation: `Found target! Match at index ${mid} equals target.`,
                    foundIndex: mid
                };
                return mid;
            }
            else if (cmp < 0) {
                const oldLeft = left;
                left = mid + 1;
                yield {
                    currentIndex: -1,
                    left,
                    right,
                    mid,
                    array,
                    explanation: `Value at mid is smaller than target. Shifting search range left boundary: left = mid + 1 = ${left}.`,
                    foundIndex: -1
                };
            }
            else {
                const oldRight = right;
                right = mid - 1;
                yield {
                    currentIndex: -1,
                    left,
                    right,
                    mid,
                    array,
                    explanation: `Value at mid is greater than target. Shifting search range right boundary: right = mid - 1 = ${right}.`,
                    foundIndex: -1
                };
            }
        }
        yield {
            currentIndex: -1,
            left,
            right,
            mid: undefined,
            array,
            explanation: `Left boundary exceeded right boundary (left: ${left}, right: ${right}). Target not found in the sorted array.`,
            foundIndex: -1
        };
        return -1;
    }
}
exports.BinarySearch = BinarySearch;
