/**
 * Algorithm/Data Structure Name: Greedy Seat Allocator
 * 
 * Purpose:
 * An algorithm that makes locally optimal choices at each stage with the hope of finding a global optimum.
 * 
 * CineBook Use Case:
 * Automatically recommends the best $K$ seats for a customer. It ranks all available seats by their 
 * geometric distance from the screen center (optimal viewing line) and greedily picks the closest available ones.
 * 
 * Real-world Applications:
 * - Airline ticket seat selectors
 * - Resource scheduling algorithms
 * - Huffman coding algorithms
 * 
 * Time Complexity:
 * - O(R * C log(R * C)) where R is rows and C is columns, due to sorting seat positions by center-distance.
 * 
 * Space Complexity:
 * - O(R * C) to store ranked seats lists.
 * 
 * Advantages:
 * - Extremely simple and fast.
 * - Guarantees locally optimal seats (center-most) are prioritized first.
 * 
 * Limitations:
 * - Does not guarantee contiguous seating for groups (a Dynamic Programming or Backtracking approach 
 *   is needed if contiguous seating constraints are strictly prioritized over pure center closeness).
 * 
 * Pseudocode:
 * function allocateGreedy(grid, k):
 *   center = (rows / 2, cols / 2)
 *   candidates = []
 *   for seat in grid:
 *     if seat is available:
 *       dist = EuclideanDistance(seat, center)
 *       candidates.push({seat, dist})
 *   sort candidates by dist ascending
 *   return candidates[0..k-1]
 */

export interface Seat {
  row: number; // 0-indexed row index
  col: number; // 0-indexed column index
  label: string; // e.g. "E6"
  isBooked: boolean;
}

export interface SeatAllocationStep {
  grid: Seat[][];
  allocatedSeats: string[];
  candidates: { label: string; distance: number; status: string }[];
  variables: Record<string, any>;
  explanation: string;
}

export class SeatAllocator {
  /**
   * Helper to compute row letter from index.
   */
  static getRowLabel(rowIdx: number): string {
    return String.fromCharCode(65 + rowIdx); // A, B, C...
  }

  /**
   * Standard greedy allocation.
   */
  static allocate(grid: Seat[][], k: number): string[] {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const centerRow = (rows - 1) / 2;
    const centerCol = (cols - 1) / 2;

    const availableSeats: { label: string; distance: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seat = grid[r][c];
        if (!seat.isBooked) {
          // Calculate Euclidean distance to center of theatre
          const distance = Math.sqrt((r - centerRow) ** 2 + (c - centerCol) ** 2);
          availableSeats.push({ label: seat.label, distance });
        }
      }
    }

    // Sort by distance (smaller distance first)
    availableSeats.sort((a, b) => a.distance - b.distance);

    return availableSeats.slice(0, k).map(s => s.label);
  }

  /**
   * Generator-based allocation for visualization.
   */
  static *allocateGenerator(grid: Seat[][], k: number): Generator<SeatAllocationStep, string[], unknown> {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const centerRow = (rows - 1) / 2;
    const centerCol = (cols - 1) / 2;

    yield {
      grid: grid.map(r => r.map(s => ({ ...s }))),
      allocatedSeats: [],
      candidates: [],
      variables: { k, centerRowLabel: SeatAllocator.getRowLabel(Math.floor(centerRow)), centerCol: Math.floor(centerCol) + 1 },
      explanation: `Starting Smart Greedy Allocation. Target count: ${k} seats. Visual center: Row ${SeatAllocator.getRowLabel(Math.floor(centerRow))}, Column ${Math.floor(centerCol) + 1}.`
    };

    const candidates: { label: string; distance: number; status: string }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seat = grid[r][c];
        if (!seat.isBooked) {
          const distance = Math.sqrt((r - centerRow) ** 2 + (c - centerCol) ** 2);
          candidates.push({ label: seat.label, distance, status: 'Calculated' });
        }
      }
    }

    yield {
      grid: grid.map(r => r.map(s => ({ ...s }))),
      allocatedSeats: [],
      candidates: [...candidates],
      variables: { totalAvailable: candidates.length },
      explanation: `Calculated distance to center for all ${candidates.length} available seats.`
    };

    // Sort candidates
    candidates.sort((a, b) => a.distance - b.distance);

    yield {
      grid: grid.map(r => r.map(s => ({ ...s }))),
      allocatedSeats: [],
      candidates: [...candidates],
      variables: {},
      explanation: `Sorted seats in ascending order of distance. Closest seats are placed at the top of the recommendation list.`
    };

    const selected: string[] = [];
    for (let i = 0; i < Math.min(k, candidates.length); i++) {
      const bestCandidate = candidates[i];
      bestCandidate.status = 'Allocated';
      selected.push(bestCandidate.label);

      yield {
        grid: grid.map(r => r.map(s => {
          if (s.label === bestCandidate.label) {
            return { ...s, isBooked: true }; // Visual override showing allocation
          }
          return { ...s };
        })),
        allocatedSeats: [...selected],
        candidates: [...candidates],
        variables: { currentSelection: bestCandidate.label, distance: bestCandidate.distance.toFixed(2) },
        explanation: `Greedily selected seat ${bestCandidate.label} because it is the next available seat closest to the center (distance: ${bestCandidate.distance.toFixed(2)} units).`
      };
    }

    yield {
      grid: grid.map(r => r.map(s => {
        if (selected.includes(s.label)) {
          return { ...s, isBooked: true };
        }
        return { ...s };
      })),
      allocatedSeats: [...selected],
      candidates: [...candidates],
      variables: {},
      explanation: `Greedy allocation completed. Recommended seats: ${selected.join(', ')}.`
    };

    return selected;
  }
}
