"use strict";
/**
 * Algorithm/Data Structure Name: Max-Heap
 *
 * Purpose:
 * A binary tree structure where each parent node is greater than or equal to its children.
 * The root node is always the maximum element in the heap.
 *
 * CineBook Use Case:
 * Used to rank movies and reviews by popularity score or rating, helping retrieve the highest-rated/trending
 * movies in logarithmic time O(log N).
 *
 * Real-world Applications:
 * - Operating System process prioritization
 * - High-speed scheduling algorithms
 * - Top-K elements finder
 *
 * Time Complexity:
 * - Insert: O(log N)
 * - Extract Max (Pop): O(log N)
 * - Peek Max: O(1)
 *
 * Space Complexity:
 * - O(N) where N is the number of elements stored.
 *
 * Advantages:
 * - Constant-time access to the largest element.
 * - Logarithmic insertion and deletion.
 * - Simple array-backed memory layout.
 *
 * Limitations:
 * - O(N) search for custom records.
 * - Slower than linear structures for small collections due to tree traversal overhead.
 *
 * Pseudocode:
 * function insert(val):
 *   array.append(val)
 *   bubbleUp(array.size - 1)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxHeap = void 0;
class MaxHeap {
    heap = [];
    compare;
    constructor(compareFn) {
        this.compare = compareFn;
    }
    getHeap() {
        return [...this.heap];
    }
    size() {
        return this.heap.length;
    }
    peek() {
        return this.heap[0];
    }
    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getLeftChildIndex(i) { return 2 * i + 1; }
    getRightChildIndex(i) { return 2 * i + 2; }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    /**
     * Standard insertion.
     */
    insert(value) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIdx = this.getParentIndex(index);
            if (this.compare(this.heap[index], this.heap[parentIdx]) > 0) {
                this.swap(index, parentIdx);
                index = parentIdx;
            }
            else {
                break;
            }
        }
    }
    /**
     * Standard extract maximum.
     */
    extractMax() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return max;
    }
    bubbleDown(index) {
        const size = this.heap.length;
        while (true) {
            let largest = index;
            const left = this.getLeftChildIndex(index);
            const right = this.getRightChildIndex(index);
            if (left < size && this.compare(this.heap[left], this.heap[largest]) > 0) {
                largest = left;
            }
            if (right < size && this.compare(this.heap[right], this.heap[largest]) > 0) {
                largest = right;
            }
            if (largest !== index) {
                this.swap(index, largest);
                index = largest;
            }
            else {
                break;
            }
        }
    }
    /**
     * Generator-based insert for visualization.
     */
    *insertGenerator(value) {
        this.heap.push(value);
        let index = this.heap.length - 1;
        yield {
            heap: [...this.heap],
            variables: { index, value },
            explanation: `Inserted ${JSON.stringify(value)} at the end of the array.`
        };
        while (index > 0) {
            const parentIdx = this.getParentIndex(index);
            yield {
                heap: [...this.heap],
                variables: { index, parentIdx, parentVal: this.heap[parentIdx], currentVal: this.heap[index] },
                explanation: `Comparing child at index ${index} with parent at index ${parentIdx}.`
            };
            if (this.compare(this.heap[index], this.heap[parentIdx]) > 0) {
                this.swap(index, parentIdx);
                yield {
                    heap: [...this.heap],
                    variables: { index: parentIdx, swappedWith: index },
                    explanation: `Swapped child and parent since child has larger value.`
                };
                index = parentIdx;
            }
            else {
                yield {
                    heap: [...this.heap],
                    variables: { index },
                    explanation: `Parent is already larger or equal. Max-heap property restored.`
                };
                break;
            }
        }
    }
    /**
     * Generator-based extractMax for visualization.
     */
    *extractMaxGenerator() {
        if (this.heap.length === 0) {
            yield { heap: [], variables: {}, explanation: "Heap is empty. Nothing to extract." };
            return undefined;
        }
        if (this.heap.length === 1) {
            const max = this.heap.pop();
            yield { heap: [], variables: { max }, explanation: `Extracted the only element: ${JSON.stringify(max)}.` };
            return max;
        }
        const max = this.heap[0];
        const last = this.heap.pop();
        this.heap[0] = last;
        let index = 0;
        yield {
            heap: [...this.heap],
            variables: { max, replacedRootWith: last },
            explanation: `Extracted root: ${JSON.stringify(max)}. Moved last element: ${JSON.stringify(last)} to root.`
        };
        const size = this.heap.length;
        while (true) {
            let largest = index;
            const left = this.getLeftChildIndex(index);
            const right = this.getRightChildIndex(index);
            yield {
                heap: [...this.heap],
                variables: { index, left, right, largest },
                explanation: `Checking child nodes of index ${index} (left: ${left}, right: ${right}).`
            };
            if (left < size && this.compare(this.heap[left], this.heap[largest]) > 0) {
                largest = left;
            }
            if (right < size && this.compare(this.heap[right], this.heap[largest]) > 0) {
                largest = right;
            }
            if (largest !== index) {
                this.swap(index, largest);
                yield {
                    heap: [...this.heap],
                    variables: { index: largest, swappedWith: index },
                    explanation: `Swapped index ${index} with child at index ${largest} to restore max-heap properties.`
                };
                index = largest;
            }
            else {
                yield {
                    heap: [...this.heap],
                    variables: { index },
                    explanation: `Heap property is restored. Extraction completed.`
                };
                break;
            }
        }
        return max;
    }
}
exports.MaxHeap = MaxHeap;
