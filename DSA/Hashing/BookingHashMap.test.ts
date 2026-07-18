import { describe, it, expect } from 'vitest';
import { BookingHashMap } from './BookingHashMap';

describe('Booking HashMap', () => {
  it('should store and retrieve booking information by ID', () => {
    const map = new BookingHashMap<string, { seats: string[]; price: number }>();
    map.put('BK-101', { seats: ['E5', 'E6'], price: 300 });
    map.put('BK-102', { seats: ['A1'], price: 150 });

    const bk101 = map.get('BK-101');
    expect(bk101).toBeDefined();
    expect(bk101?.seats).toEqual(['E5', 'E6']);

    expect(map.get('BK-999')).toBeUndefined();
  });

  it('should handle collision chaining and updates correctly', () => {
    // Map with only 2 buckets to guarantee collisions
    const map = new BookingHashMap<string, string>(2);
    map.put('KeyA', 'ValA');
    map.put('KeyB', 'ValB'); // Will likely land in one of the 2 buckets colliding
    map.put('KeyA', 'ValAUpdated');

    expect(map.get('KeyA')).toBe('ValAUpdated');
    expect(map.get('KeyB')).toBe('ValB');
  });

  it('should delete keys correctly', () => {
    const map = new BookingHashMap<string, string>();
    map.put('KeyA', 'ValA');
    map.remove('KeyA');
    expect(map.get('KeyA')).toBeUndefined();
  });
});
