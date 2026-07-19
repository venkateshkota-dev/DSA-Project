"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const LinearSearch_1 = require("./LinearSearch");
const BinarySearch_1 = require("./BinarySearch");
(0, vitest_1.describe)('Searching Algorithms', () => {
    const unsorted = [5, 3, 8, 1, 9];
    const sorted = [1, 3, 5, 8, 9];
    (0, vitest_1.it)('should find index using LinearSearch', () => {
        const idx = LinearSearch_1.LinearSearch.run(unsorted, 8);
        (0, vitest_1.expect)(idx).toBe(2);
        const missingIdx = LinearSearch_1.LinearSearch.run(unsorted, 10);
        (0, vitest_1.expect)(missingIdx).toBe(-1);
    });
    (0, vitest_1.it)('should find index using BinarySearch', () => {
        const idx = BinarySearch_1.BinarySearch.run(sorted, 8, (a, b) => a - b);
        (0, vitest_1.expect)(idx).toBe(3);
        const missingIdx = BinarySearch_1.BinarySearch.run(sorted, 10, (a, b) => a - b);
        (0, vitest_1.expect)(missingIdx).toBe(-1);
    });
});
