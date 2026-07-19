"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Graph_1 = require("./Graph");
const Dijkstra_1 = require("./Dijkstra");
const AStar_1 = require("./AStar");
(0, vitest_1.describe)('Dijkstra and A* Pathfinding', () => {
    // Create a sample graph of theaters
    // A (0,0) -5- B (0,4) -10- C (3,4)
    // \                     /
    //  8------- D (3,0) ---2/
    const g = new Graph_1.Graph();
    g.addVertex({ id: 'A', name: 'User Location', x: 0, y: 0 });
    g.addVertex({ id: 'B', name: 'Theatre B', x: 0, y: 4 });
    g.addVertex({ id: 'C', name: 'Theatre C', x: 3, y: 4 });
    g.addVertex({ id: 'D', name: 'Theatre D', x: 3, y: 0 });
    g.addEdge('A', 'B', 5);
    g.addEdge('B', 'C', 10);
    g.addEdge('A', 'D', 8);
    g.addEdge('D', 'C', 2);
    (0, vitest_1.it)('should find the shortest path using Dijkstra', () => {
        const generator = Dijkstra_1.Dijkstra.runGenerator(g, 'A', 'C');
        let step = generator.next();
        while (!step.done) {
            step = generator.next();
        }
        const result = step.value;
        (0, vitest_1.expect)(result.path).toEqual(['A', 'D', 'C']);
        (0, vitest_1.expect)(result.distance).toBe(10); // A->D = 8, D->C = 2 -> total = 10 (shorter than A->B->C which is 15)
    });
    (0, vitest_1.it)('should find the shortest path using A*', () => {
        const generator = AStar_1.AStar.runGenerator(g, 'A', 'C');
        let step = generator.next();
        while (!step.done) {
            step = generator.next();
        }
        const result = step.value;
        (0, vitest_1.expect)(result.path).toEqual(['A', 'D', 'C']);
        (0, vitest_1.expect)(result.distance).toBe(10);
    });
});
