import { describe, it, expect } from 'vitest';
import { Graph } from './Graph';
import { Dijkstra } from './Dijkstra';
import { AStar } from './AStar';

describe('Dijkstra and A* Pathfinding', () => {
  // Create a sample graph of theaters
  // A (0,0) -5- B (0,4) -10- C (3,4)
  // \                     /
  //  8------- D (3,0) ---2/
  const g = new Graph();
  g.addVertex({ id: 'A', name: 'User Location', x: 0, y: 0 });
  g.addVertex({ id: 'B', name: 'Theatre B', x: 0, y: 4 });
  g.addVertex({ id: 'C', name: 'Theatre C', x: 3, y: 4 });
  g.addVertex({ id: 'D', name: 'Theatre D', x: 3, y: 0 });

  g.addEdge('A', 'B', 5);
  g.addEdge('B', 'C', 10);
  g.addEdge('A', 'D', 8);
  g.addEdge('D', 'C', 2);

  it('should find the shortest path using Dijkstra', () => {
    const generator = Dijkstra.runGenerator(g, 'A', 'C');
    let step = generator.next();
    while (!step.done) {
      step = generator.next();
    }
    const result = step.value;
    expect(result.path).toEqual(['A', 'D', 'C']);
    expect(result.distance).toBe(10); // A->D = 8, D->C = 2 -> total = 10 (shorter than A->B->C which is 15)
  });

  it('should find the shortest path using A*', () => {
    const generator = AStar.runGenerator(g, 'A', 'C');
    let step = generator.next();
    while (!step.done) {
      step = generator.next();
    }
    const result = step.value;
    expect(result.path).toEqual(['A', 'D', 'C']);
    expect(result.distance).toBe(10);
  });
});
