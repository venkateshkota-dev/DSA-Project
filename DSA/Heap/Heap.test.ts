import { describe, it, expect } from 'vitest';
import { MinHeap } from './MinHeap';
import { MaxHeap } from './MaxHeap';
import { PriorityQueue } from './PriorityQueue';

describe('Heaps and Priority Queue', () => {
  it('should maintain MinHeap property', () => {
    const minHeap = new MinHeap<number>((a, b) => a - b);
    minHeap.insert(10);
    minHeap.insert(5);
    minHeap.insert(15);
    minHeap.insert(3);

    expect(minHeap.peek()).toBe(3);
    expect(minHeap.extractMin()).toBe(3);
    expect(minHeap.extractMin()).toBe(5);
  });

  it('should maintain MaxHeap property', () => {
    const maxHeap = new MaxHeap<number>((a, b) => a - b);
    maxHeap.insert(10);
    maxHeap.insert(5);
    maxHeap.insert(15);
    maxHeap.insert(20);

    expect(maxHeap.peek()).toBe(20);
    expect(maxHeap.extractMax()).toBe(20);
    expect(maxHeap.extractMax()).toBe(15);
  });

  it('should prioritize items correctly in PriorityQueue', () => {
    const pq = new PriorityQueue<string>();
    pq.enqueue('Low Priority Task', 3);
    pq.enqueue('High Priority Task', 1);
    pq.enqueue('Medium Priority Task', 2);

    expect(pq.peek()).toBe('High Priority Task');
    expect(pq.dequeue()).toBe('High Priority Task');
    expect(pq.dequeue()).toBe('Medium Priority Task');
  });
});
