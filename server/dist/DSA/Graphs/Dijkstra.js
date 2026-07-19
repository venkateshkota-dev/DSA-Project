"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dijkstra = void 0;
const PriorityQueue_1 = require("../Heap/PriorityQueue");
class Dijkstra {
    /**
     * Standard Dijkstra execution.
     */
    static run(graph, startId, endId) {
        const distances = {};
        const previous = {};
        const visited = new Set();
        const pq = new PriorityQueue_1.PriorityQueue();
        for (const vertex of graph.getVertices()) {
            distances[vertex.id] = Infinity;
            previous[vertex.id] = null;
        }
        distances[startId] = 0;
        pq.enqueue(startId, 0);
        while (!pq.isEmpty()) {
            const currentId = pq.dequeue();
            if (visited.has(currentId))
                continue;
            visited.add(currentId);
            if (endId && currentId === endId)
                break;
            for (const edge of graph.getNeighbors(currentId)) {
                if (visited.has(edge.to))
                    continue;
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
    static reconstructPath(previous, endId) {
        const path = [];
        let current = endId;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        return path[0] === endId && path.length === 1 ? [] : path; // Path exists check
    }
    /**
     * Generator-based Dijkstra execution for visualization.
     */
    static *runGenerator(graph, startId, endId) {
        const distances = {};
        const previous = {};
        const visited = new Set();
        const pq = new PriorityQueue_1.PriorityQueue();
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
            const currentId = pq.dequeue();
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
                }
                else {
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
exports.Dijkstra = Dijkstra;
