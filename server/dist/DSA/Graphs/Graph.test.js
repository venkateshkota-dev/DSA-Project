"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Graph_1 = require("./Graph");
(0, vitest_1.describe)('Graph Data Structure', () => {
    (0, vitest_1.it)('should add vertices correctly', () => {
        const g = new Graph_1.Graph();
        g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });
        g.addVertex({ id: 'B', name: 'Theatre B', x: 10, y: 10 });
        (0, vitest_1.expect)(g.hasVertex('A')).toBe(true);
        (0, vitest_1.expect)(g.hasVertex('B')).toBe(true);
        (0, vitest_1.expect)(g.hasVertex('C')).toBe(false);
        (0, vitest_1.expect)(g.getVertex('A')?.name).toBe('Theatre A');
    });
    (0, vitest_1.it)('should add edges and retrieve neighbors correctly', () => {
        const g = new Graph_1.Graph();
        g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });
        g.addVertex({ id: 'B', name: 'Theatre B', x: 10, y: 10 });
        g.addEdge('A', 'B', 15);
        const neighborsA = g.getNeighbors('A');
        const neighborsB = g.getNeighbors('B');
        (0, vitest_1.expect)(neighborsA.length).toBe(1);
        (0, vitest_1.expect)(neighborsA[0]).toEqual({ to: 'B', weight: 15 });
        (0, vitest_1.expect)(neighborsB.length).toBe(1);
        (0, vitest_1.expect)(neighborsB[0]).toEqual({ to: 'A', weight: 15 });
    });
    (0, vitest_1.it)('should throw error when adding edges to non-existent nodes', () => {
        const g = new Graph_1.Graph();
        g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });
        (0, vitest_1.expect)(() => g.addEdge('A', 'B', 10)).toThrow();
    });
});
