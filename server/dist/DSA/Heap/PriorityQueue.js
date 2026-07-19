"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
const MinHeap_1 = require("./MinHeap");
class PriorityQueue {
    minHeap;
    constructor() {
        this.minHeap = new MinHeap_1.MinHeap((a, b) => a.priority - b.priority);
    }
    enqueue(element, priority) {
        this.minHeap.insert({ element, priority });
    }
    dequeue() {
        const item = this.minHeap.extractMin();
        return item ? item.element : undefined;
    }
    peek() {
        const item = this.minHeap.peek();
        return item ? item.element : undefined;
    }
    size() {
        return this.minHeap.size();
    }
    isEmpty() {
        return this.minHeap.size() === 0;
    }
    getQueue() {
        return this.minHeap.getHeap();
    }
    /**
     * Generator enqueue.
     */
    *enqueueGenerator(element, priority) {
        const item = { element, priority };
        const gen = this.minHeap.insertGenerator(item);
        let step = gen.next();
        while (!step.done) {
            yield {
                queue: step.value.heap,
                variables: { ...step.value.variables, element, priority },
                explanation: `Queue Enqueue: ${step.value.explanation}`
            };
            step = gen.next();
        }
    }
    /**
     * Generator dequeue.
     */
    *dequeueGenerator() {
        const gen = this.minHeap.extractMinGenerator();
        let step = gen.next();
        let result;
        while (!step.done) {
            yield {
                queue: step.value.heap,
                variables: step.value.variables,
                explanation: `Queue Dequeue: ${step.value.explanation}`
            };
            step = gen.next();
        }
        // Standard JS generator return values are not returned in the standard iteration.
        // The minHeap extractMinGenerator returns the min item at the end of the generator.
        // In TS/JS generator.next() returns `{ value: returnValue, done: true }`.
        // Let's grab it:
        const finalVal = step.value;
        return finalVal ? finalVal.element : undefined;
    }
}
exports.PriorityQueue = PriorityQueue;
