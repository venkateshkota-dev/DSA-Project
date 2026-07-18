import { Graph, GraphNode, GraphEdge } from './Graph';
import { PriorityQueue } from '../Heap/PriorityQueue';

/**
 * Algorithm/Data Structure Name: A* Search Algorithm
 * 
 * Purpose:
 * Finds the shortest path between two nodes in a graph using a heuristic function to guide search.
 * 
 * CineBook Use Case:
 * Compares pathfinding routes with Dijkstra, showing that A* reaches the theatre by exploring 
 * fewer nodes because it leverages direction/heuristic estimation (user distance to target).
 * 
 * Real-world Applications:
 * - AI routing in video games
 * - Maps navigation services
 * - Robot navigation
 * 
 * Time Complexity:
 * - O(E log V) in the worst case, but significantly faster than Dijkstra in practice when using a good heuristic.
 * 
 * Space Complexity:
 * - O(V) to maintain open set, closed set, scores, and parent linkages.
 * 
 * Advantages:
 * - Extremely efficient; avoids expanding nodes in directions away from the target.
 * - Optimal and complete (guaranteed to find the shortest path if heuristic is admissible).
 * 
 * Limitations:
 * - Performance depends heavily on the heuristic function.
 * - Higher memory footprint than depth-first search variations.
 * 
 * Pseudocode:
 * function AStar(Graph, start, target, heuristic):
 *   openSet.add(start)
 *   gScore[start] = 0
 *   fScore[start] = heuristic(start, target)
 *   while openSet is not empty:
 *     current = node in openSet with lowest fScore
 *     if current == target: return reconstructPath(current)
 *     openSet.remove(current)
 *     closedSet.add(current)
 *     for neighbor of current:
 *       tentative_gScore = gScore[current] + weight(current, neighbor)
 *       if tentative_gScore < gScore[neighbor]:
 *         prev[neighbor] = current
 *         gScore[neighbor] = tentative_gScore
 *         fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, target)
 *         if neighbor not in openSet: openSet.add(neighbor)
 */

export interface AStarStep {
  currentNode: string | null;
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  previous?: Record<string, string | null>;
  visited: string[];
  pq: { element: string; priority: number }[];
  relaxingNode: string | null;
  explanation: string;
  finalPath?: string[];
}

export class AStar {
  /**
   * Euclidean distance heuristic.
   */
  static heuristic(nodeA: GraphNode, nodeB: GraphNode): number {
    return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
  }

  /**
   * Standard A* execution.
   */
  static run(graph: Graph, startId: string, endId: string) {
    const startNode = graph.getVertex(startId);
    const endNode = graph.getVertex(endId);
    if (!startNode || !endNode) {
      throw new Error("Start and target nodes must exist in the graph.");
    }

    const gScores: Record<string, number> = {};
    const fScores: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    for (const vertex of graph.getVertices()) {
      gScores[vertex.id] = Infinity;
      fScores[vertex.id] = Infinity;
      previous[vertex.id] = null;
    }

    gScores[startId] = 0;
    const initialH = AStar.heuristic(startNode, endNode);
    fScores[startId] = initialH;

    pq.enqueue(startId, initialH);

    while (!pq.isEmpty()) {
      const currentId = pq.dequeue()!;

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId === endId) break;

      const currentNode = graph.getVertex(currentId)!;
      for (const edge of graph.getNeighbors(currentId)) {
        if (visited.has(edge.to)) continue;

        const tentativeG = gScores[currentId] + edge.weight;
        if (tentativeG < gScores[edge.to]) {
          const neighborNode = graph.getVertex(edge.to)!;
          const h = AStar.heuristic(neighborNode, endNode);
          
          gScores[edge.to] = tentativeG;
          fScores[edge.to] = tentativeG + h;
          previous[edge.to] = currentId;
          
          pq.enqueue(edge.to, tentativeG + h);
        }
      }
    }

    return { gScores, fScores, previous };
  }

  /**
   * Generator-based A* execution for visualization.
   */
  static *runGenerator(graph: Graph, startId: string, endId: string): Generator<AStarStep, { path: string[]; distance: number }, unknown> {
    const startNode = graph.getVertex(startId);
    const endNode = graph.getVertex(endId);
    if (!startNode || !endNode) {
      throw new Error("Start and target nodes must exist in the graph.");
    }

    const gScores: Record<string, number> = {};
    const hScores: Record<string, number> = {};
    const fScores: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    for (const vertex of graph.getVertices()) {
      gScores[vertex.id] = Infinity;
      hScores[vertex.id] = AStar.heuristic(vertex, endNode);
      fScores[vertex.id] = Infinity;
      previous[vertex.id] = null;
    }

    gScores[startId] = 0;
    fScores[startId] = hScores[startId];
    pq.enqueue(startId, fScores[startId]);

    yield {
      currentNode: null,
      gScores: { ...gScores },
      hScores: { ...hScores },
      fScores: { ...fScores },
      previous: { ...previous },
      visited: [],
      pq: pq.getQueue(),
      relaxingNode: null,
      explanation: `Initialized scores. User starting node: ${startId}. Heuristic distance to target: ${hScores[startId].toFixed(2)}. Queue priority f(start) = g(0) + h(${hScores[startId].toFixed(2)}).`
    };

    let found = false;

    while (!pq.isEmpty()) {
      const pqItems = pq.getQueue();
      const currentId = pq.dequeue()!;

      yield {
        currentNode: currentId,
        gScores: { ...gScores },
        hScores: { ...hScores },
        fScores: { ...fScores },
        visited: Array.from(visited),
        pq: pqItems,
        relaxingNode: null,
        explanation: `Dequeued node ${currentId} with the smallest f-score: ${fScores[currentId].toFixed(2)}.`
      };

      if (visited.has(currentId)) {
        yield {
          currentNode: currentId,
          gScores: { ...gScores },
          hScores: { ...hScores },
          fScores: { ...fScores },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: null,
          explanation: `Node ${currentId} has already been visited. Skipping.`
        };
        continue;
      }

      visited.add(currentId);

      yield {
        currentNode: currentId,
        gScores: { ...gScores },
        hScores: { ...hScores },
        fScores: { ...fScores },
        visited: Array.from(visited),
        pq: pq.getQueue(),
        relaxingNode: null,
        explanation: `Marked node ${currentId} as visited.`
      };

      if (currentId === endId) {
        found = true;
        yield {
          currentNode: currentId,
          gScores: { ...gScores },
          hScores: { ...hScores },
          fScores: { ...fScores },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: null,
          explanation: `Reached destination node ${endId}! Path reconstruction begins.`
        };
        break;
      }

      const currentNode = graph.getVertex(currentId)!;
      for (const edge of graph.getNeighbors(currentId)) {
        yield {
          currentNode: currentId,
          gScores: { ...gScores },
          hScores: { ...hScores },
          fScores: { ...fScores },
          visited: Array.from(visited),
          pq: pq.getQueue(),
          relaxingNode: edge.to,
          explanation: `Evaluating neighbor ${edge.to}.`
        };

        if (visited.has(edge.to)) {
          yield {
            currentNode: currentId,
            gScores: { ...gScores },
            hScores: { ...hScores },
            fScores: { ...fScores },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `Neighbor ${edge.to} is already visited. Skipping.`
          };
          continue;
        }

        const tentativeG = gScores[currentId] + edge.weight;
        if (tentativeG < gScores[edge.to]) {
          const neighborNode = graph.getVertex(edge.to)!;
          const h = hScores[edge.to];
          const oldF = fScores[edge.to];
          
          gScores[edge.to] = tentativeG;
          fScores[edge.to] = tentativeG + h;
          previous[edge.to] = currentId;
          pq.enqueue(edge.to, tentativeG + h);

          yield {
            currentNode: currentId,
            gScores: { ...gScores },
            hScores: { ...hScores },
            fScores: { ...fScores },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `Relaxed edge to ${edge.to}. Found shorter path g(${edge.to}) = ${tentativeG}. Enqueued with priority f(${edge.to}) = ${tentativeG} + h(${h.toFixed(1)}) = ${(tentativeG + h).toFixed(1)} (previous f: ${oldF === Infinity ? 'Infinity' : oldF.toFixed(1)}).`
          };
        } else {
          yield {
            currentNode: currentId,
            gScores: { ...gScores },
            hScores: { ...hScores },
            fScores: { ...fScores },
            visited: Array.from(visited),
            pq: pq.getQueue(),
            relaxingNode: edge.to,
            explanation: `Path to ${edge.to} through ${currentId} is longer or equal (g = ${tentativeG}, best g = ${gScores[edge.to]}).`
          };
        }
      }
    }

    // Path reconstruction
    const path: string[] = [];
    if (found) {
      let curr: string | null = endId;
      while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
      }
    }

    yield {
      currentNode: null,
      gScores: { ...gScores },
      hScores: { ...hScores },
      fScores: { ...fScores },
      previous: { ...previous },
      visited: Array.from(visited),
      pq: pq.getQueue(),
      relaxingNode: null,
      explanation: found 
        ? `Route found: ${path.join(' -> ')}. Total distance: ${gScores[endId]}.`
        : `No path exists from source to destination.`,
      finalPath: path
    };

    return { path, distance: gScores[endId] || Infinity };
  }
}
