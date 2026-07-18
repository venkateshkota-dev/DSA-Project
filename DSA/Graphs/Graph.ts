/**
 * Algorithm/Data Structure Name: Weighted Graph (Adjacency List)
 * 
 * Purpose:
 * Represents a network of nodes (vertices) and connections (edges) with associated numeric weights.
 * 
 * CineBook Use Case:
 * Represents the map of theatres in a region. Theatres are vertices, and roads connecting them are 
 * edges. The weights represent travel distances in kilometers. Used by Dijkstra and A* to find 
 * the shortest driving routes from the user's location to various theatres.
 * 
 * Real-world Applications:
 * - GPS navigation systems (Google Maps, Waze)
 * - Network routing protocols (OSPF)
 * - Social network connection mapping
 * 
 * Time Complexity:
 * - Add Vertex: O(1)
 * - Add Edge: O(1)
 * - Get Neighbors: O(1) (on average, lookup in map)
 * 
 * Space Complexity:
 * - O(V + E) where V is the number of vertices and E is the number of edges.
 * 
 * Advantages:
 * - Efficient space utilization for sparse graphs compared to adjacency matrices (O(V^2)).
 * - Fast iteration over neighbor nodes.
 * 
 * Limitations:
 * - Slower edge lookup O(deg(V)) compared to adjacency matrix O(1).
 * 
 * Pseudocode:
 * class Graph:
 *   vertices: Map<string, Node>
 *   adjacencyList: Map<string, List<Edge>>
 * 
 *   function addVertex(id, data):
 *     vertices.set(id, data)
 *     adjacencyList.set(id, empty list)
 * 
 *   function addEdge(source, destination, weight):
 *     adjacencyList.get(source).append({node: destination, weight: weight})
 */

export interface GraphNode {
  id: string;
  name: string;
  x: number; // Used for A* coordinates
  y: number; // Used for A* coordinates
}

export interface GraphEdge {
  to: string;
  weight: number;
}

export class Graph {
  private vertices: Map<string, GraphNode> = new Map();
  private adjacencyList: Map<string, GraphEdge[]> = new Map();

  constructor() {}

  /**
   * Adds a vertex to the graph.
   */
  addVertex(node: GraphNode): void {
    this.vertices.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Adds a weighted edge between two vertices. By default, it creates an undirected edge.
   */
  addEdge(fromId: string, toId: string, weight: number, bidirectional = true): void {
    if (!this.adjacencyList.has(fromId) || !this.adjacencyList.has(toId)) {
      throw new Error(`Vertices ${fromId} and ${toId} must exist in the graph before adding an edge.`);
    }

    this.adjacencyList.get(fromId)!.push({ to: toId, weight });
    if (bidirectional) {
      this.adjacencyList.get(toId)!.push({ to: fromId, weight });
    }
  }

  /**
   * Retrieves all vertices in the graph.
   */
  getVertices(): GraphNode[] {
    return Array.from(this.vertices.values());
  }

  /**
   * Retrieves a specific vertex by its ID.
   */
  getVertex(id: string): GraphNode | undefined {
    return this.vertices.get(id);
  }

  /**
   * Retrieves neighbors of a specific vertex.
   */
  getNeighbors(id: string): GraphEdge[] {
    return this.adjacencyList.get(id) || [];
  }

  /**
   * Checks if a vertex exists.
   */
  hasVertex(id: string): boolean {
    return this.vertices.has(id);
  }

  /**
   * Clears the graph.
   */
  clear(): void {
    this.vertices.clear();
    this.adjacencyList.clear();
  }
}
