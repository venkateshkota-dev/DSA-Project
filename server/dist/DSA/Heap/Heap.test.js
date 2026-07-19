"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const MinHeap_1 = require("./MinHeap");
const MaxHeap_1 = require("./MaxHeap");
const PriorityQueue_1 = require("./PriorityQueue");
(0, vitest_1.describe)('Heaps and Priority Queue', () => {
    (0, vitest_1.it)('should maintain MinHeap property', () => {
        const minHeap = new MinHeap_1.MinHeap((a, b) => a - b);
        minHeap.insert(10);
        minHeap.insert(5);
        minHeap.insert(15);
        minHeap.insert(3);
        (0, vitest_1.expect)(minHeap.peek()).toBe(3);
        (0, vitest_1.expect)(minHeap.extractMin()).toBe(3);
        (0, vitest_1.expect)(minHeap.extractMin()).toBe(5);
    });
    (0, vitest_1.it)('should maintain MaxHeap property', () => {
        const maxHeap = new MaxHeap_1.MaxHeap((a, b) => a - b);
        maxHeap.insert(10);
        maxHeap.insert(5);
        maxHeap.insert(15);
        maxHeap.insert(20);
        (0, vitest_1.expect)(maxHeap.peek()).toBe(20);
        (0, vitest_1.expect)(maxHeap.extractMax()).toBe(20);
        (0, vitest_1.expect)(maxHeap.extractMax()).toBe(15);
    });
    (0, vitest_1.it)('should prioritize items correctly in PriorityQueue', () => {
        const pq = new PriorityQueue_1.PriorityQueue();
        pq.enqueue('Low Priority Task', 3);
        pq.enqueue('High Priority Task', 1);
        pq.enqueue('Medium Priority Task', 2);
        (0, vitest_1.expect)(pq.peek()).toBe('High Priority Task');
        (0, vitest_1.expect)(pq.dequeue()).toBe('High Priority Task');
        (0, vitest_1.expect)(pq.dequeue()).toBe('Medium Priority Task');
    });
});
