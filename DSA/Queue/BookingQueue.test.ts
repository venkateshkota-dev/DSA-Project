import { describe, it, expect } from 'vitest';
import { BookingQueue } from './BookingQueue';

describe('Booking Queue', () => {
  it('should enqueue and dequeue in FIFO order', () => {
    const queue = new BookingQueue<string>();
    queue.enqueue('UserA');
    queue.enqueue('UserB');

    expect(queue.front()).toBe('UserA');
    expect(queue.rear()).toBe('UserB');
    expect(queue.dequeue()).toBe('UserA');
    expect(queue.front()).toBe('UserB');
    expect(queue.size()).toBe(1);
  });
});
