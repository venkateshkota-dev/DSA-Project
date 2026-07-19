"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexityAnalyzer = void 0;
const MergeSort_1 = require("../Sorting/MergeSort");
const QuickSort_1 = require("../Sorting/QuickSort");
const HeapSort_1 = require("../Sorting/HeapSort");
const LinearSearch_1 = require("../Searching/LinearSearch");
const BinarySearch_1 = require("../Searching/BinarySearch");
const Graph_1 = require("../Graphs/Graph");
const Dijkstra_1 = require("../Graphs/Dijkstra");
const AStar_1 = require("../Graphs/AStar");
class ComplexityAnalyzer {
    /**
     * Benchmark Sorts (Merge, Quick, Heap) on random number arrays.
     */
    static benchmarkSorts(sizes = [10, 50, 100, 500, 1000]) {
        const results = {
            mergeSort: [],
            quickSort: [],
            heapSort: []
        };
        const numCompare = (a, b) => a - b;
        for (const size of sizes) {
            // Create random array
            const originalArray = Array.from({ length: size }, () => Math.floor(Math.random() * 10000));
            // 1. Merge Sort
            let mergeOps = 0;
            const mergeComp = (a, b) => {
                mergeOps++;
                return a - b;
            };
            const arrCopy1 = [...originalArray];
            const startMerge = performance.now();
            MergeSort_1.MergeSort.run(arrCopy1, mergeComp);
            const endMerge = performance.now();
            results.mergeSort.push({
                size,
                timeMs: parseFloat((endMerge - startMerge).toFixed(4)),
                operations: mergeOps
            });
            // 2. Quick Sort
            let quickOps = 0;
            const quickComp = (a, b) => {
                quickOps++;
                return a - b;
            };
            const arrCopy2 = [...originalArray];
            const startQuick = performance.now();
            QuickSort_1.QuickSort.run(arrCopy2, quickComp);
            const endQuick = performance.now();
            results.quickSort.push({
                size,
                timeMs: parseFloat((endQuick - startQuick).toFixed(4)),
                operations: quickOps
            });
            // 3. Heap Sort
            let heapOps = 0;
            const heapComp = (a, b) => {
                heapOps++;
                return a - b;
            };
            const arrCopy3 = [...originalArray];
            const startHeap = performance.now();
            HeapSort_1.HeapSort.run(arrCopy3, heapComp);
            const endHeap = performance.now();
            results.heapSort.push({
                size,
                timeMs: parseFloat((endHeap - startHeap).toFixed(4)),
                operations: heapOps
            });
        }
        return results;
    }
    /**
     * Benchmark Searches (Linear vs Binary) on sorted arrays.
     */
    static benchmarkSearches(sizes = [100, 500, 1000, 5000, 10000]) {
        const results = {
            linearSearch: [],
            binarySearch: []
        };
        for (const size of sizes) {
            const sortedArray = Array.from({ length: size }, (_, i) => i * 2);
            // Look for an item near the end to force worst case
            const target = sortedArray[size - 2];
            // 1. Linear Search
            let linOps = 0;
            const linComp = (a, b) => {
                linOps++;
                return a === b;
            };
            const startLin = performance.now();
            LinearSearch_1.LinearSearch.run(sortedArray, target, linComp);
            const endLin = performance.now();
            results.linearSearch.push({
                size,
                timeMs: parseFloat((endLin - startLin).toFixed(4)),
                operations: linOps
            });
            // 2. Binary Search
            let binOps = 0;
            const binComp = (a, b) => {
                binOps++;
                return a - b;
            };
            const startBin = performance.now();
            BinarySearch_1.BinarySearch.run(sortedArray, target, binComp);
            const endBin = performance.now();
            results.binarySearch.push({
                size,
                timeMs: parseFloat((endBin - startBin).toFixed(4)),
                operations: binOps
            });
        }
        return results;
    }
    /**
     * Benchmark pathfinding (Dijkstra vs A*) on a grid graph layout.
     * Generates a square grid graph of size width x width.
     */
    static benchmarkPathfinding(gridSize = 10) {
        const g = new Graph_1.Graph();
        // Add nodes in grid
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                g.addVertex({
                    id: `node_${r}_${c}`,
                    name: `Theatre R${r} C${c}`,
                    x: c * 10,
                    y: r * 10
                });
            }
        }
        // Add edges with weight equal to distance
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const fromId = `node_${r}_${c}`;
                if (r + 1 < gridSize) {
                    const toId = `node_${r + 1}_${c}`;
                    g.addEdge(fromId, toId, 10, true);
                }
                if (c + 1 < gridSize) {
                    const toId = `node_${r}_${c + 1}`;
                    g.addEdge(fromId, toId, 10, true);
                }
            }
        }
        const startId = `node_0_0`;
        const endId = `node_${gridSize - 1}_${gridSize - 1}`;
        // Dijkstra
        const dGen = Dijkstra_1.Dijkstra.runGenerator(g, startId, endId);
        let dOps = 0;
        const startD = performance.now();
        let dNext = dGen.next();
        while (!dNext.done) {
            dOps++;
            dNext = dGen.next();
        }
        const endD = performance.now();
        // A*
        const aGen = AStar_1.AStar.runGenerator(g, startId, endId);
        let aOps = 0;
        const startA = performance.now();
        let aNext = aGen.next();
        while (!aNext.done) {
            aOps++;
            aNext = aGen.next();
        }
        const endA = performance.now();
        return {
            dijkstra: {
                timeMs: parseFloat((endD - startD).toFixed(4)),
                operations: dOps,
                pathLength: dNext.value?.path.length || 0
            },
            aStar: {
                timeMs: parseFloat((endA - startA).toFixed(4)),
                operations: aOps,
                pathLength: aNext.value?.path.length || 0
            }
        };
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
