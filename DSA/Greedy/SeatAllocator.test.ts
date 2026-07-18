import { describe, it, expect } from 'vitest';
import { SeatAllocator, Seat } from './SeatAllocator';

describe('Greedy Seat Allocator', () => {
  it('should allocate seats closest to center', () => {
    // 3 rows, 3 columns. Center is Row 1, Col 1 (B2).
    const grid: Seat[][] = [];
    for (let r = 0; r < 3; r++) {
      grid.push([]);
      for (let c = 0; c < 3; c++) {
        grid[r].push({
          row: r,
          col: c,
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
          isBooked: false
        });
      }
    }

    // Allocate 1 seat -> Should be B2
    const selection1 = SeatAllocator.allocate(grid, 1);
    expect(selection1).toEqual(['B2']);

    // Book B2 and allocate again
    grid[1][1].isBooked = true; // B2 booked
    const selection2 = SeatAllocator.allocate(grid, 2);
    // B2 is booked. Center neighbors are B1, B3, A2, C2 (distance 1).
    // Sorted distance list will prioritize these.
    expect(selection2.length).toBe(2);
    expect(['B1', 'B3', 'A2', 'C2']).toContain(selection2[0]);
    expect(['B1', 'B3', 'A2', 'C2']).toContain(selection2[1]);
  });
});
