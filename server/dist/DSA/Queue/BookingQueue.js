"use strict";
/**
 * Algorithm/Data Structure Name: Queue (First-In, First-Out - FIFO)
 *
 * Purpose:
 * A linear data structure that follows the First-In, First-Out (FIFO) principle.
 * The first element added is the first one to be removed.
 *
 * CineBook Use Case:
 * Implements the Booking Queue Simulation. When high demand occurs for a popular movie release,
 * booking requests are placed in a FIFO queue and processed sequentially to avoid database lock contention.
 *
 * Real-world Applications:
 * - Print spooler queues
 * - Message brokers (RabbitMQ, Kafka partitions)
 * - Thread pool request processing
 * - Breadth-First Search (BFS) queue
 *
 * Time Complexity:
 * - Enqueue (Add): O(1)
 * - Dequeue (Remove): O(1)
 * - Peek (Front): O(1)
 *
 * Space Complexity:
 * - O(N) where N is the number of items in the queue.
 *
 * Advantages:
 * - Sequential processing guarantees fairness (FIFO).
 * - Constant-time O(1) modification endpoints.
 *
 * Limitations:
 * - Lacks random access search; must iterate through elements to read middle contents.
 *
 * Pseudocode:
 * class Queue:
 *   items = []
 *   function enqueue(val):
 *     items.append(val)
 *   function dequeue():
 *     if isEmpty(): return error
 *     return items.removeFirst()
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingQueue = void 0;
class BookingQueue {
    items = [];
    constructor() { }
    enqueue(element) {
        this.items.push(element);
    }
    dequeue() {
        return this.items.shift();
    }
    front() {
        return this.items[0];
    }
    rear() {
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    clear() {
        this.items = [];
    }
    getQueue() {
        return [...this.items];
    }
    /**
     * Generator-based Enqueue for visualization.
     */
    *enqueueGenerator(element) {
        this.items.push(element);
        yield {
            queue: [...this.items],
            front: this.front() || null,
            rear: this.rear() || null,
            variables: { element, size: this.items.length },
            explanation: `Enqueued item ${JSON.stringify(element)} into the queue. Added to the rear.`
        };
    }
    /**
     * Generator-based Dequeue for visualization.
     */
    *dequeueGenerator() {
        if (this.isEmpty()) {
            yield {
                queue: [],
                front: null,
                rear: null,
                variables: {},
                explanation: `Queue is empty. Dequeue operation is invalid.`
            };
            return undefined;
        }
        const element = this.items.shift();
        yield {
            queue: [...this.items],
            front: this.front() || null,
            rear: this.rear() || null,
            variables: { dequeuedElement: element, size: this.items.length },
            explanation: `Dequeued item ${JSON.stringify(element)} from the front of the queue.`
        };
        return element;
    }
}
exports.BookingQueue = BookingQueue;
