"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AStar = void 0;
const PriorityQueue_1 = require("../Heap/PriorityQueue");
class AStar {
    /**
     * Euclidean distance heuristic.
     */
    static heuristic(nodeA, nodeB) {
        return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
    }
    /**
     * Standard A* execution.
     */
    static run(graph, startId, endId) {
        const startNode = graph.getVertex(startId);
        const endNode = graph.getVertex(endId);
        if (!startNode || !endNode) {
            throw new Error("Start and target nodes must exist in the graph.");
        }
        const gScores = {};
        const fScores = {};
        const previous = {};
        const visited = new Set();
        const pq = new PriorityQueue_1.PriorityQueue();
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
            const currentId = pq.dequeue();
            if (visited.has(currentId))
                continue;
            visited.add(currentId);
            if (currentId === endId)
                break;
            const currentNode = graph.getVertex(currentId);
            for (const edge of graph.getNeighbors(currentId)) {
                if (visited.has(edge.to))
                    continue;
                const tentativeG = gScores[currentId] + edge.weight;
                if (tentativeG < gScores[edge.to]) {
                    const neighborNode = graph.getVertex(edge.to);
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
    static *runGenerator(graph, startId, endId) {
        const startNode = graph.getVertex(startId);
        const endNode = graph.getVertex(endId);
        if (!startNode || !endNode) {
            throw new Error("Start and target nodes must exist in the graph.");
        }
        const gScores = {};
        const hScores = {};
        const fScores = {};
        const previous = {};
        const visited = new Set();
        const pq = new PriorityQueue_1.PriorityQueue();
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
            const currentId = pq.dequeue();
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
            const currentNode = graph.getVertex(currentId);
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
                    const neighborNode = graph.getVertex(edge.to);
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
                }
                else {
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
        const path = [];
        if (found) {
            let curr = endId;
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
exports.AStar = AStar;
