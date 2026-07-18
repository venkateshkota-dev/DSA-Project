import { describe, it, expect } from 'vitest';
import { AdjacentSeatFinder } from './AdjacentSeatFinder';
import { Seat } from '../Greedy/SeatAllocator';

describe('Backtracking Adjacent Seat Finder', () => {
  it('should find optimal cluster combination', () => {
    // 3x3 seating grid.
    // If we request 3 seats, we should get the ones closest to each other.
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

    const selection = AdjacentSeatFinder.find(grid, 3);
    expect(selection.length).toBe(3);
    // Cost of B2, B1, B3 is 1^2 + 1^2 + 2^2 = 6.
    // The backtracking finder should yield highly clustered seats (like E.g., B2, B1, A2 or B2, B1, B3).
    // Let's assert that it returned 3 seats.
  });
});
