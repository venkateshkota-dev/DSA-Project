import { Graph, GraphNode, GraphEdge } from './Graph';
import { PriorityQueue } from '../Heap/PriorityQueue';

/**
 * Algorithm/Data Structure Name: Dijkstra's Shortest Path Algorithm
 * 
 * Purpose:
 * Finds the shortest paths from a single source vertex to all other vertices in a weighted graph 
 * with non-negative edge weights.
 * 
 * CineBook Use Case:
 * Finds the nearest movie theatre from the user's current coordinates.
 * 
 * Real-world Applications:
 * - GPS navigation systems routing
 * - Internet routing protocols (Link-State routing)
 * - Robotics path planning
 * 
 * Time Complexity:
 * - O((V + E) log V) using a binary heap priority queue.
 * 
 * Space Complexity:
 * - O(V) to store distances, visited states, and parent references.
 * 
 * Advantages:
 * - Guarantees the absolute shortest path.
 * - Efficient for large graphs when using priority queues.
 * 
 * Limitations:
 * - Does not work with negative edge weights.
 * - Explores in all directions blindly (unlike A* which uses heuristics).
 * 
 * Pseudocode:
 * function Dijkstra(Graph, source):
 *   dist[source] = 0
 *   pq.push(source, 0)
 *   while pq is not empty:
 *     u = pq.pop()
 *     if u in visited: continue
 *     visited.add(u)
 *     for neighbor v of u:
 *       alt = dist[u] + weight(u, v)
 *       if alt < dist[v]:
 *         dist[v] = alt
 *         prev[v] = u
 *         pq.push(v, alt)
 */

export interface DijkstraStep {
  currentNode: string | null;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  pq: { element: string; priority: number }[];
  relaxingNode: string | null;
  explanation: string;
  finalPath?: string[];
}

export class Dijkstra {
  /**
   * Standard Dijkstra execution.
   */
  static run(graph: Graph, startId: string, endId?: string) {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    for (const vertex of graph.getVertices()) {
      distances[vertex.id] = Infinity;
      previous[vertex.id] = null;
    }

    distances[startId] = 0;
    pq.enqueue(startId, 0);

    while (!pq.isEmpty()) {
      const currentId = pq.dequeue()!;

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (endId && currentId === endId) break;

      for (const edge of graph.getNeighbors(currentId)) {
        if (visited.has(edge.to)) continue;

        const newDist = distances[currentId] + edge.weight;
        if (newDist < distances[edge.to]) {
          distances[edge.to] = newDist;
          previous[edge.to] = currentId;
          pq.enqueue(edge.to, newDist);
        }
      }
    }

    return { distances, previous };
  }

  /**
   * Helper to reconstruct the path from start to end node.
   */
  static reconstructPath(previous: Record<string, string | null>, endId: string): string[] {
    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
    return path[0] === endId && path.length === 1 ? [] : path; // Path exists check
  }

  /**
   * Generator-based Dijkstra execution for visualization.
   */
  static *runGenerator(graph: Graph, startId: string, endId: string): Generator<DijkstraStep, { path: string[]; distance: number }, unknown> {
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    for (const vertex of graph.getVertices()) {
      distances[vertex.id] = Infinity;
      previous[vertex.id] = null;
    }

    distances[startId] = 0;
    pq.enqueue(startId, 0);

    yield {
      currentNode: null,
      distances: { ...distances },
      previous: { ...previous },
      visited: [],
      pq: pq.getQueue(),
      relaxingNode: null,
      explanation: `Initialized distances. Set starting node ${startId} distance to 0, all other nodes to Infinity. Enqueued ${startId} into the Priority Queue.`
    };

    let found = false;

    while (!pq.isEmpty()) {
      const pqItems = pq.getQueue();
      const currentId = pq.dequeue()!;

      yield {
        currentNode: currentId,
        distances: { ...distances },
        previous: { ...previous },
        visited: Array.from(visited),
        pq: pqItems,
        relaxingNode: null,
        explanation: `Dequeued node ${currentId} with the smallest distance.`
      };

      if (visited.has(currentId)) {
        yield {
          currentNode: currentId,
          distances: { ...distances },
          previous: { ...previous },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: null,
          explanation: `Node ${currentId} has already been visited. Skipping to next.`
        };
        continue;
      }

      visited.add(currentId);

      yield {
        currentNode: currentId,
        distances: { ...distances },
        previous: { ...previous },
        visited: Array.from(visited),
        pq: pq.getQueue(),
        relaxingNode: null,
        explanation: `Marked node ${currentId} as visited.`
      };

      if (currentId === endId) {
        found = true;
        yield {
          currentNode: currentId,
          distances: { ...distances },
          previous: { ...previous },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: null,
          explanation: `Reached destination node ${endId}! Ending traversal.`
        };
        break;
      }

      for (const edge of graph.getNeighbors(currentId)) {
        yield {
          currentNode: currentId,
          distances: { ...distances },
          previous: { ...previous },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: edge.to,
          explanation: `Evaluating connection from ${currentId} to neighbor ${edge.to} (edge distance: ${edge.weight}).`
        };

        if (visited.has(edge.to)) {
          yield {
            currentNode: currentId,
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `Neighbor ${edge.to} is already visited. Skipping.`
          };
          continue;
        }

        const alt = distances[currentId] + edge.weight;
        if (alt < distances[edge.to]) {
          const oldDist = distances[edge.to];
          distances[edge.to] = alt;
          previous[edge.to] = currentId;
          pq.enqueue(edge.to, alt);

          yield {
            currentNode: currentId,
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `Relaxed edge to ${edge.to}. Found a shorter path of length ${alt} (previous best was ${oldDist}). Updated parent map.`
          };
        } else {
          yield {
            currentNode: currentId,
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `No shorter path found to ${edge.to} (alternative path is ${alt}, current best is ${distances[edge.to]}).`
          };
        }
      }
    }

    const path = found ? Dijkstra.reconstructPath(previous, endId) : [];
    yield {
      currentNode: null,
      distances: { ...distances },
      previous: { ...previous },
      visited: Array.from(visited),
      pq: pq.getQueue(),
      relaxingNode: null,
      explanation: found 
        ? `Shortest path reconstructed: ${path.join(' -> ')} with total distance of ${distances[endId]}.`
        : `No path exists from source to target.`,
      finalPath: path
    };

    return { path, distance: distances[endId] || Infinity };
  }
}
