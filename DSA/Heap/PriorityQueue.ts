import { MinHeap } from './MinHeap';

/**
 * Algorithm/Data Structure Name: Priority Queue
 * 
 * Purpose:
 * An abstract data type where each element has an associated priority.
 * Elements with higher priorities are served before elements with lower priorities.
 * 
 * CineBook Use Case:
 * Prioritizes movie recommendations and custom alerts based on search scores, availability percentages, and pricing tiers.
 * 
 * Real-world Applications:
 * - Network packet routing and throttling
 * - Dijkstra's shortest path algorithm (relaxation priority)
 * - CPU job scheduling
 * 
 * Time Complexity:
 * - Enqueue (Insert): O(log N)
 * - Dequeue (Extract): O(log N)
 * - Peek: O(1)
 * 
 * Space Complexity:
 * - O(N) where N is the number of elements.
 * 
 * Advantages:
 * - High-speed logarithmic modifications.
 * - Dynamic priority adjustment.
 * 
 * Limitations:
 * - Overhead compared to standard linear queues.
 * 
 * Pseudocode:
 * class PriorityQueue:
 *   heap = new MinHeap()
 *   function enqueue(item, priority):
 *     heap.insert({item, priority})
 *   function dequeue():
 *     return heap.extractMin().item
 */

export interface PQItem<T> {
  element: T;
  priority: number;
}

export interface PQStep {
  queue: any[];
  variables: Record<string, any>;
  explanation: string;
}

export class PriorityQueue<T> {
  private minHeap: MinHeap<PQItem<T>>;

  constructor() {
    this.minHeap = new MinHeap<PQItem<T>>((a, b) => a.priority - b.priority);
  }

  enqueue(element: T, priority: number): void {
    this.minHeap.insert({ element, priority });
  }

  dequeue(): T | undefined {
    const item = this.minHeap.extractMin();
    return item ? item.element : undefined;
  }

  peek(): T | undefined {
    const item = this.minHeap.peek();
    return item ? item.element : undefined;
  }

  size(): number {
    return this.minHeap.size();
  }

  isEmpty(): boolean {
    return this.minHeap.size() === 0;
  }

  getQueue(): PQItem<T>[] {
    return this.minHeap.getHeap();
  }

  /**
   * Generator enqueue.
   */
  *enqueueGenerator(element: T, priority: number): Generator<PQStep, void, unknown> {
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
  *dequeueGenerator(): Generator<PQStep, T | undefined, unknown> {
    const gen = this.minHeap.extractMinGenerator();
    let step = gen.next();
    let result: PQItem<T> | undefined;

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
    const finalVal = (step as IteratorReturnResult<PQItem<T> | undefined>).value;
    return finalVal ? finalVal.element : undefined;
  }
}
