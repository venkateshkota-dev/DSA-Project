"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const MergeSort_1 = require("./MergeSort");
const QuickSort_1 = require("./QuickSort");
const HeapSort_1 = require("./HeapSort");
(0, vitest_1.describe)('Sorting Algorithms', () => {
    const getUnsorted = () => [9, 3, 7, 5, 1, 8, 2, 6, 4];
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const comp = (a, b) => a - b;
    (0, vitest_1.it)('should sort using MergeSort', () => {
        const arr = getUnsorted();
        const result = MergeSort_1.MergeSort.run(arr, comp);
        (0, vitest_1.expect)(result).toEqual(sorted);
    });
    (0, vitest_1.it)('should sort using QuickSort', () => {
        const arr = getUnsorted();
        const result = QuickSort_1.QuickSort.run(arr, comp);
        (0, vitest_1.expect)(result).toEqual(sorted);
    });
    (0, vitest_1.it)('should sort using HeapSort', () => {
        const arr = getUnsorted();
        const result = HeapSort_1.HeapSort.run(arr, comp);
        (0, vitest_1.expect)(result).toEqual(sorted);
    });
});
