import { describe, it, expect } from 'vitest';
import { Graph } from './Graph';

describe('Graph Data Structure', () => {
  it('should add vertices correctly', () => {
    const g = new Graph();
    g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });
    g.addVertex({ id: 'B', name: 'Theatre B', x: 10, y: 10 });

    expect(g.hasVertex('A')).toBe(true);
    expect(g.hasVertex('B')).toBe(true);
    expect(g.hasVertex('C')).toBe(false);
    expect(g.getVertex('A')?.name).toBe('Theatre A');
  });

  it('should add edges and retrieve neighbors correctly', () => {
    const g = new Graph();
    g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });
    g.addVertex({ id: 'B', name: 'Theatre B', x: 10, y: 10 });
    
    g.addEdge('A', 'B', 15);

    const neighborsA = g.getNeighbors('A');
    const neighborsB = g.getNeighbors('B');

    expect(neighborsA.length).toBe(1);
    expect(neighborsA[0]).toEqual({ to: 'B', weight: 15 });

    expect(neighborsB.length).toBe(1);
    expect(neighborsB[0]).toEqual({ to: 'A', weight: 15 });
  });

  it('should throw error when adding edges to non-existent nodes', () => {
    const g = new Graph();
    g.addVertex({ id: 'A', name: 'Theatre A', x: 0, y: 0 });

    expect(() => g.addEdge('A', 'B', 10)).toThrow();
  });
});
