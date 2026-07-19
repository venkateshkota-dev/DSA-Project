"use strict";
/**
 * Algorithm/Data Structure Name: Heap Sort
 *
 * Purpose:
 * A comparison-based sorting technique based on a Binary Heap data structure.
 * It is similar to selection sort where we first find the maximum element and place it at the end.
 *
 * CineBook Use Case:
 * Sorts movies by popularity (ticket sales count or score).
 *
 * Real-world Applications:
 * - Systems memory priority management
 * - Embedded systems with strict memory limitations (guarantees O(N log N) without recursion stacks)
 * - Sorting algorithms hybrids (e.g. IntroSort uses HeapSort as a fallback if recursion deepens)
 *
 * Time Complexity:
 * - Worst Case: O(N log N)
 * - Best Case: O(N log N)
 * - Average Case: O(N log N)
 *
 * Space Complexity:
 * - O(1) auxiliary space (sorting is completely in-place).
 *
 * Advantages:
 * - Highly memory efficient (in-place).
 * - Consistent performance; no worst-case performance decay (unlike QuickSort).
 *
 * Limitations:
 * - Unstable sort.
 * - Poor cache locality and reference performance compared to QuickSort.
 *
 * Pseudocode:
 * function HeapSort(arr):
 *   buildMaxHeap(arr)
 *   for i from arr.length - 1 down to 1:
 *     swap(arr[0], arr[i])
 *     heapify(arr, 0, i)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeapSort = void 0;
class HeapSort {
    /**
     * Standard Heap Sort.
     */
    static run(array, compare) {
        const arr = [...array];
        const n = arr.length;
        // Build heap (rearrange array)
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            HeapSort.heapify(arr, n, i, compare);
        }
        // One by one extract an element from heap
        for (let i = n - 1; i > 0; i--) {
            // Move current root to end
            const temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            // call max heapify on the reduced heap
            HeapSort.heapify(arr, i, 0, compare);
        }
        return arr;
    }
    static heapify(arr, n, i, compare) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < n && compare(arr[l], arr[largest]) > 0) {
            largest = l;
        }
        if (r < n && compare(arr[r], arr[largest]) > 0) {
            largest = r;
        }
        if (largest !== i) {
            const swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;
            HeapSort.heapify(arr, n, largest, compare);
        }
    }
    /**
     * Generator-based Heap Sort for visualization.
     */
    static *runGenerator(array, compare) {
        const arr = [...array];
        const n = arr.length;
        yield {
            array: [...arr],
            comparingIndices: [],
            swappingIndices: [],
            explanation: `Starting Heap Sort. Phase 1: Build Max-Heap from the unsorted array.`
        };
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* HeapSort.heapifyGenerator(arr, n, i, compare);
        }
        yield {
            array: [...arr],
            comparingIndices: [],
            swappingIndices: [],
            explanation: `Max-Heap constructed successfully. Phase 2: Successively extract the maximum element (root) and sort.`
        };
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            const rootVal = arr[0];
            const endVal = arr[i];
            const swap = arr[0];
            arr[0] = arr[i];
            arr[i] = swap;
            yield {
                array: [...arr],
                comparingIndices: [],
                swappingIndices: [0, i],
                explanation: `Swapped root (max element ${JSON.stringify(rootVal)}) with the last unsorted element (${JSON.stringify(endVal)}) at index ${i}.`
            };
            yield {
                array: [...arr],
                comparingIndices: [],
                swappingIndices: [],
                explanation: `Re-heapifying the remaining unsorted range [0..${i - 1}].`
            };
            yield* HeapSort.heapifyGenerator(arr, i, 0, compare);
        }
        yield {
            array: [...arr],
            comparingIndices: [],
            swappingIndices: [],
            explanation: `Heap Sort completed! Final sorted array: [${arr.map(x => JSON.stringify(x)).join(', ')}].`
        };
        return arr;
    }
    static *heapifyGenerator(arr, n, i, compare) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        yield {
            array: [...arr],
            comparingIndices: [i],
            swappingIndices: [],
            explanation: `Heapifying index ${i}. Checking children (left: ${l < n ? l : 'none'}, right: ${r < n ? r : 'none'}).`
        };
        if (l < n) {
            yield {
                array: [...arr],
                comparingIndices: [i, l],
                swappingIndices: [],
                explanation: `Comparing parent index ${i} (${JSON.stringify(arr[i])}) with left child index ${l} (${JSON.stringify(arr[l])}).`
            };
            if (compare(arr[l], arr[largest]) > 0) {
                largest = l;
            }
        }
        if (r < n) {
            yield {
                array: [...arr],
                comparingIndices: [largest, r],
                swappingIndices: [],
                explanation: `Comparing current largest node (${JSON.stringify(arr[largest])}) with right child index ${r} (${JSON.stringify(arr[r])}).`
            };
            if (compare(arr[r], arr[largest]) > 0) {
                largest = r;
            }
        }
        if (largest !== i) {
            const swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;
            yield {
                array: [...arr],
                comparingIndices: [],
                swappingIndices: [i, largest],
                explanation: `Parent index ${i} was smaller. Swapped with child at index ${largest}.`
            };
            yield* HeapSort.heapifyGenerator(arr, n, largest, compare);
        }
    }
}
exports.HeapSort = HeapSort;
