/**
 * Algorithm/Data Structure Name: Adjacent Seat Finder (Backtracking)
 * 
 * Purpose:
 * A systematic backtracking search to find combinations of elements that satisfy specific constraints, 
 * pruning paths that violate the constraint before they are fully explored.
 * 
 * CineBook Use Case:
 * If a customer requests $K$ contiguous seats, but no single row has $K$ adjacent seats, this algorithm 
 * searches the grid to find the next best clustered group of $K$ seats (e.g. split across adjacent rows 
 * or split by one aisle). It uses a pairwise-distance cost function and prunes paths whose partial costs 
 * already exceed the best-known minimum cost.
 * 
 * Real-world Applications:
 * - N-Queens solver
 * - Sudoku solvers
 * - Travelling Salesperson Problem (TSP) branch-and-bound
 * 
 * Time Complexity:
 * - O(C(M, K)) where M is the number of available seats, which is exponential O(M^K) in the worst case. 
 *   Pruning drastically reduces this in practice.
 * 
 * Space Complexity:
 * - O(K) recursion call stack depth.
 * 
 * Advantages:
 * - Guarantees finding the absolute best alternative arrangement.
 * - Early pruning saves execution time.
 * 
 * Limitations:
 * - Without pruning and size limits, exponential complexity can crash or hang on large grids.
 * 
 * Pseudocode:
 * function search(index, currentSet):
 *   if currentSet.size == K:
 *     if cost(currentSet) < minCost:
 *       minCost = cost(currentSet)
 *       bestSet = currentSet
 *     return
 *   if cost(currentSet) >= minCost: return (Pruning)
 *   for i from index to availableSeats.length:
 *     currentSet.push(availableSeats[i])
 *     search(i + 1, currentSet)
 *     currentSet.pop() (Backtrack)
 */

import { Seat } from '../Greedy/SeatAllocator';

export interface BacktrackingStep {
  grid: Seat[][];
  currentCombination: string[];
  bestCombination: string[];
  recursionStack: string[];
  explanation: string;
  pruned: boolean;
}

export class AdjacentSeatFinder {
  /**
   * Calculates the clustering cost: the sum of squared Euclidean distances between all pairs of seats in the set.
   * If a single seat, cost is 0.
   */
  static getCost(seats: { r: number; c: number }[]): number {
    if (seats.length <= 1) return 0;
    let totalDist = 0;
    for (let i = 0; i < seats.length; i++) {
      for (let j = i + 1; j < seats.length; j++) {
        totalDist += (seats[i].r - seats[j].r) ** 2 + (seats[i].c - seats[j].c) ** 2;
      }
    }
    return totalDist;
  }

  /**
   * Helper to fetch candidate available seats close to center or first available.
   * To keep backtracking search space small and fast, we only consider the closest 15 available seats.
   */
  private static getCandidates(grid: Seat[][]): { label: string; r: number; c: number }[] {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const centerRow = (rows - 1) / 2;
    const centerCol = (cols - 1) / 2;

    const list: { label: string; r: number; c: number; dist: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seat = grid[r][c];
        if (!seat.isBooked) {
          const dist = Math.sqrt((r - centerRow) ** 2 + (c - centerCol) ** 2);
          list.push({ label: seat.label, r, c, dist });
        }
      }
    }
    // Sort by distance to center and pick first 12 for the backtracking sandbox to keep it highly responsive
    list.sort((a, b) => a.dist - b.dist);
    return list.slice(0, 12).map(({ label, r, c }) => ({ label, r, c }));
  }

  /**
   * Standard backtracking search.
   */
  static find(grid: Seat[][], k: number): string[] {
    const candidates = AdjacentSeatFinder.getCandidates(grid);
    if (candidates.length < k) return [];

    let bestSet: { label: string; r: number; c: number }[] = [];
    let minCost = Infinity;

    function backtrack(index: number, current: { label: string; r: number; c: number }[]) {
      const currentCost = AdjacentSeatFinder.getCost(current);

      // Pruning condition
      if (currentCost >= minCost) return;

      if (current.length === k) {
        minCost = currentCost;
        bestSet = [...current];
        return;
      }

      for (let i = index; i < candidates.length; i++) {
        current.push(candidates[i]);
        backtrack(i + 1, current);
        current.pop(); // backtracking step
      }
    }

    backtrack(0, []);
    return bestSet.map(s => s.label);
  }

  /**
   * Generator-based backtracking search for visualization.
   */
  static *findGenerator(grid: Seat[][], k: number): Generator<BacktrackingStep, string[], unknown> {
    const candidates = AdjacentSeatFinder.getCandidates(grid);

    yield {
      grid: grid.map(r => r.map(s => ({ ...s }))),
      currentCombination: [],
      bestCombination: [],
      recursionStack: [],
      explanation: `Starting backtracking seat search for ${k} seats. Candidates limited to the ${candidates.length} closest available seats to optimize search depth.`,
      pruned: false
    };

    if (candidates.length < k) {
      yield {
        grid: grid.map(r => r.map(s => ({ ...s }))),
        currentCombination: [],
        bestCombination: [],
        recursionStack: [],
        explanation: `Not enough available seats in the theater to satisfy request!`,
        pruned: false
      };
      return [];
    }

    let bestSet: { label: string; r: number; c: number }[] = [];
    let minCost = Infinity;

    const current: { label: string; r: number; c: number }[] = [];

    function* backtrackHelper(index: number): Generator<BacktrackingStep, void, unknown> {
      const currentCost = AdjacentSeatFinder.getCost(current);
      const labels = current.map(c => c.label);

      // Check if we can prune
      if (currentCost >= minCost) {
        yield {
          grid: grid.map(r => r.map(s => ({ ...s }))),
          currentCombination: [...labels],
          bestCombination: bestSet.map(s => s.label),
          recursionStack: [...labels],
          explanation: `PRUNED! Current combination cost (${currentCost.toFixed(2)}) exceeds best cost found so far (${minCost.toFixed(2)}). Backtracking immediately.`,
          pruned: true
        };
        return;
      }

      if (current.length === k) {
        minCost = currentCost;
        bestSet = [...current];
        yield {
          grid: grid.map(r => r.map(s => ({ ...s }))),
          currentCombination: [...labels],
          bestCombination: bestSet.map(s => s.label),
          recursionStack: [...labels],
          explanation: `New optimal combination found: ${labels.join(', ')} with cost score ${currentCost.toFixed(2)}.`,
          pruned: false
        };
        return;
      }

      for (let i = index; i < candidates.length; i++) {
        current.push(candidates[i]);
        const newLabels = current.map(c => c.label);

        yield {
          grid: grid.map(r => r.map(s => ({ ...s }))),
          currentCombination: [...newLabels],
          bestCombination: bestSet.map(s => s.label),
          recursionStack: [...newLabels],
          explanation: `Pushed seat ${candidates[i].label} onto stack. Recursing...`,
          pruned: false
        };

        yield* backtrackHelper(i + 1);

        current.pop();
        const backtrackedLabels = current.map(c => c.label);

        yield {
          grid: grid.map(r => r.map(s => ({ ...s }))),
          currentCombination: [...backtrackedLabels],
          bestCombination: bestSet.map(s => s.label),
          recursionStack: [...backtrackedLabels],
          explanation: `Backtracked: Popped seat ${candidates[i].label} off stack. Exploring alternatives.`,
          pruned: false
        };
      }
    }

    yield* backtrackHelper(0);

    const finalLabels = bestSet.map(s => s.label);
    yield {
      grid: grid.map(r => r.map(s => {
        if (finalLabels.includes(s.label)) {
          return { ...s, isBooked: true };
        }
        return { ...s };
      })),
      currentCombination: [],
      bestCombination: [...finalLabels],
      recursionStack: [],
      explanation: `Backtracking complete! Best clustered seats combination returned: ${finalLabels.join(', ')} (Clustering cost score: ${minCost.toFixed(2)}).`,
      pruned: false
    };

    return finalLabels;
  }
}
