"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const SeatAllocator_1 = require("./SeatAllocator");
(0, vitest_1.describe)('Greedy Seat Allocator', () => {
    (0, vitest_1.it)('should allocate seats closest to center', () => {
        // 3 rows, 3 columns. Center is Row 1, Col 1 (B2).
        const grid = [];
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
        const selection1 = SeatAllocator_1.SeatAllocator.allocate(grid, 1);
        (0, vitest_1.expect)(selection1).toEqual(['B2']);
        // Book B2 and allocate again
        grid[1][1].isBooked = true; // B2 booked
        const selection2 = SeatAllocator_1.SeatAllocator.allocate(grid, 2);
        // B2 is booked. Center neighbors are B1, B3, A2, C2 (distance 1).
        // Sorted distance list will prioritize these.
        (0, vitest_1.expect)(selection2.length).toBe(2);
        (0, vitest_1.expect)(['B1', 'B3', 'A2', 'C2']).toContain(selection2[0]);
        (0, vitest_1.expect)(['B1', 'B3', 'A2', 'C2']).toContain(selection2[1]);
    });
});
