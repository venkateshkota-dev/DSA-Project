import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, RotateCcw, Sliders, Code, Info, Sparkles, Terminal } from 'lucide-react';
import { Graph } from '../../../DSA/Graphs/Graph';
import { Dijkstra } from '../../../DSA/Graphs/Dijkstra';
import { AStar } from '../../../DSA/Graphs/AStar';
import { BinaryTree } from '../../../DSA/Trees/BinaryTree';
import { BinarySearchTree } from '../../../DSA/Trees/BinarySearchTree';
import { LinearSearch } from '../../../DSA/Searching/LinearSearch';
import { BinarySearch } from '../../../DSA/Searching/BinarySearch';
import { MergeSort } from '../../../DSA/Sorting/MergeSort';
import { QuickSort } from '../../../DSA/Sorting/QuickSort';
import { HeapSort } from '../../../DSA/Sorting/HeapSort';
import { MinHeap } from '../../../DSA/Heap/MinHeap';
import { UndoSeatSelection } from '../../../DSA/Stack/UndoSeatSelection';
import { BookingQueue } from '../../../DSA/Queue/BookingQueue';
import { BookingHashMap } from '../../../DSA/Hashing/BookingHashMap';
import { SeatAllocator, Seat } from '../../../DSA/Greedy/SeatAllocator';
import { AdjacentSeatFinder } from '../../../DSA/Backtracking/AdjacentSeatFinder';
import { Mutex } from '../../../DSA/Concurrency/Mutex';
import { Semaphore } from '../../../DSA/Concurrency/Semaphore';
import { AlgorithmPlayer } from '../../../DSA/Visualizer/AlgorithmPlayer';

// Pseudocode for each algorithm
const CODE_SNIPPETS: Record<string, string[]> = {
  dijkstra: [
    "function Dijkstra(graph, start):",
    "  distances = fill(Infinity)",
    "  distances[start] = 0",
    "  pq.enqueue(start, 0)",
    "  while pq is not empty:",
    "    curr = pq.dequeue()",
    "    if curr in visited: continue",
    "    visited.add(curr)",
    "    for neighbor in graph.getNeighbors(curr):",
    "      alt = distances[curr] + neighbor.weight",
    "      if alt < distances[neighbor]:",
    "        distances[neighbor] = alt",
    "        prev[neighbor] = curr",
    "        pq.enqueue(neighbor, alt)"
  ],
  astar: [
    "function AStar(graph, start, target):",
    "  gScores = fill(Infinity)",
    "  gScores[start] = 0",
    "  pq.enqueue(start, h(start))",
    "  while pq is not empty:",
    "    curr = pq.dequeue()",
    "    if curr in visited: continue",
    "    visited.add(curr)",
    "    if curr == target: break",
    "    for neighbor in graph.getNeighbors(curr):",
    "      tentativeG = gScores[curr] + weight",
    "      if tentativeG < gScores[neighbor]:",
    "        gScores[neighbor] = tentativeG",
    "        fScore = tentativeG + h(neighbor)",
    "        pq.enqueue(neighbor, fScore)"
  ],
  linearsearch: [
    "function LinearSearch(arr, target):",
    "  for i from 0 to arr.length - 1:",
    "    if arr[i] == target:",
    "      return i",
    "  return -1"
  ],
  binarysearch: [
    "function BinarySearch(arr, target):",
    "  low = 0, high = arr.length - 1",
    "  while low <= high:",
    "    mid = floor((low + high) / 2)",
    "    if arr[mid] == target: return mid",
    "    else if arr[mid] < target: low = mid + 1",
    "    else: high = mid - 1",
    "  return -1"
  ],
  mergesort: [
    "function MergeSort(arr, start, end):",
    "  if start >= end: return",
    "  mid = floor((start + end) / 2)",
    "  MergeSort(arr, start, mid)",
    "  MergeSort(arr, mid + 1, end)",
    "  Merge(arr, start, mid, end)"
  ],
  quicksort: [
    "function QuickSort(arr, low, high):",
    "  if low < high:",
    "    pi = Partition(arr, low, high)",
    "    QuickSort(arr, low, pi - 1)",
    "    QuickSort(arr, pi + 1, high)"
  ],
  heapsort: [
    "function HeapSort(arr):",
    "  BuildMaxHeap(arr)",
    "  for i from arr.length - 1 down to 1:",
    "    swap(arr[0], arr[i])",
    "    MaxHeapify(arr, 0, i)"
  ],
  binarytree: [
    "function LevelOrderTraverse(root):",
    "  queue.enqueue(root)",
    "  while queue is not empty:",
    "    curr = queue.dequeue()",
    "    visit(curr)",
    "    if curr.left: queue.enqueue(curr.left)",
    "    if curr.right: queue.enqueue(curr.right)"
  ],
  bst: [
    "function InsertBST(root, val):",
    "  if root is null: return Node(val)",
    "  if val < root.val:",
    "    root.left = InsertBST(root.left, val)",
    "  else:",
    "    root.right = InsertBST(root.right, val)",
    "  return root"
  ],
  minheap: [
    "function insertMinHeap(val):",
    "  array.push(val)",
    "  bubbleUp(array.length - 1)",
    "",
    "function bubbleUp(idx):",
    "  while parent(idx) > current(idx):",
    "    swap(parent(idx), current(idx))",
    "    idx = parent(idx)"
  ],
  stack: [
    "function push(stack, val):",
    "  stack.items.push(val)",
    "",
    "function pop(stack):",
    "  if stack.isEmpty(): return error",
    "  return stack.items.pop()"
  ],
  queue: [
    "function enqueue(queue, val):",
    "  queue.items.push(val)",
    "",
    "function dequeue(queue):",
    "  if queue.isEmpty(): return error",
    "  return queue.items.shift()"
  ],
  hashmap: [
    "function put(key, value):",
    "  index = hash(key) % size",
    "  bucket = buckets[index]",
    "  if key exists: update value",
    "  else bucket.push({key, value})"
  ],
  greedy: [
    "function AllocateSeats(grid, k):",
    "  center = (rows / 2, cols / 2)",
    "  candidates = []",
    "  for seat in grid:",
    "    if seat is available:",
    "      dist = distance(seat, center)",
    "      candidates.push({seat, dist})",
    "  sort candidates by dist ascending",
    "  return candidates[0..k-1]"
  ],
  backtracking: [
    "function backtrack(index, currentSet):",
    "  if cost(currentSet) >= minCost: return (Pruning)",
    "  if currentSet.size == K:",
    "    minCost = cost(currentSet)",
    "    bestSet = currentSet; return",
    "  for i from index to candidates.length:",
    "    currentSet.push(candidates[i])",
    "    backtrack(i + 1, currentSet)",
    "    currentSet.pop() (Backtrack)"
  ],
  mutex: [
    "function acquireMutex(owner):",
    "  if not locked:",
    "    locked = true; activeOwner = owner; return",
    "  queue.push(owner)",
    "  wait()",
    "",
    "function releaseMutex():",
    "  if queue has items:",
    "    activeOwner = queue.shift()",
    "    resolveWaiting()",
    "  else: locked = false; activeOwner = null"
  ],
  semaphore: [
    "function acquireSemaphore(owner):",
    "  if permits > 0: permits--; activeOwners.push(owner); return",
    "  queue.push(owner); wait()",
    "",
    "function releaseSemaphore(owner):",
    "  activeOwners.remove(owner)",
    "  if queue has items:",
    "    activeOwners.push(queue.shift())",
    "    resolveWaiting()",
    "  else: permits++"
  ]
};

// Theoretical details for specs
const THEORY_METADATA: Record<string, {
  name: string;
  purpose: string;
  cinebookUse: string;
  timeComp: string;
  spaceComp: string;
  pros: string[];
  cons: string[];
}> = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    purpose: "Single-source shortest path calculation.",
    cinebookUse: "Determines the nearest cinema theater from user location coordinates.",
    timeComp: "O((V + E) log V)",
    spaceComp: "O(V)",
    pros: ["Guarantees shortest path.", "Handles arbitrary graph structures."],
    cons: ["Blind expansion (no direction vector).", "Cannot handle negative weights."]
  },
  astar: {
    name: "A* Search Algorithm",
    purpose: "Heuristic-guided path planning.",
    cinebookUse: "Compares path routes with Dijkstra using distance heuristics.",
    timeComp: "O(E log V) Avg",
    spaceComp: "O(V)",
    pros: ["Highly optimal node pruning.", "Examines fewer nodes than Dijkstra."],
    cons: ["Heuristic selection determines correctness.", "High memory consumption for big maps."]
  },
  linearsearch: {
    name: "Linear Search",
    purpose: "Sequential list scan lookup.",
    cinebookUse: "Scans scheduled listings sequentially when arrays are unsorted.",
    timeComp: "O(N)",
    spaceComp: "O(1)",
    pros: ["Simple to implement.", "Does not require data sorting."],
    cons: ["Extremely slow for large databases."]
  },
  binarysearch: {
    name: "Binary Search",
    purpose: "Logarithmic lookup on sorted items.",
    cinebookUse: "Locates scheduled showtime timings rapidly inside chronological lists.",
    timeComp: "O(log N)",
    spaceComp: "O(1)",
    pros: ["Extremely fast search speed.", "Minimal comparisons count."],
    cons: ["Requires data list to be pre-sorted."]
  },
  mergesort: {
    name: "Merge Sort",
    purpose: "Stable divide-and-conquer sorting.",
    cinebookUse: "Sorts cinema listings based on user review scores.",
    timeComp: "O(N log N)",
    spaceComp: "O(N)",
    pros: ["Stable sort (preserves order).", "Consistent log N speed."],
    cons: ["Temporary array allocation O(N) memory overhead."]
  },
  quicksort: {
    name: "Quick Sort",
    purpose: "Fast in-place partitioning sort.",
    cinebookUse: "Orders ticket pricing lists in ascending sequence.",
    timeComp: "O(N log N) Avg",
    spaceComp: "O(log N)",
    pros: ["Incredibly fast in practice.", "Minimal cache overhead (in-place)."],
    cons: ["Unstable sort.", "Degenerates to quadratic time on bad pivots."]
  },
  heapsort: {
    name: "Heap Sort",
    purpose: "Comparison-based heap sorting.",
    cinebookUse: "Sorts movies by dynamic ticket sales popularity score.",
    timeComp: "O(N log N)",
    spaceComp: "O(1)",
    pros: ["In-place sort.", "Consistent execution boundaries (no N^2 fallback)."],
    cons: ["Unstable sort.", "Higher cache miss rates than QuickSort."]
  },
  binarytree: {
    name: "Binary Tree Traversal",
    purpose: "Hierarchical data representation.",
    cinebookUse: "Traverses structural maps using Level Order Breadth-First traversal.",
    timeComp: "O(N)",
    spaceComp: "O(N)",
    pros: ["Excellent representation of structural hierarchies."],
    cons: ["Search is slow O(N) without ordering constraints."]
  },
  bst: {
    name: "Binary Search Tree",
    purpose: "Ordered key storage and indexing.",
    cinebookUse: "Stores sorted lists of booking records for fast searches.",
    timeComp: "O(log N) Avg",
    spaceComp: "O(N)",
    pros: ["Maintains key order dynamically.", "Faster than linear arrays."],
    cons: ["Can skew into a linked-list format without self-balancing."]
  },
  minheap: {
    name: "Min Heap",
    purpose: "Priority-based parent-smaller binary tree.",
    cinebookUse: "Retrieves lowest-priced cinema tickets dynamically in O(1) peek time.",
    timeComp: "O(log N) Insert/Pop",
    spaceComp: "O(N)",
    pros: ["Efficient minimum value lookup.", "Logarithmic modifications."],
    cons: ["Arbitrary lookups require linear time scan."]
  },
  stack: {
    name: "Stack (LIFO Structure)",
    purpose: "Last-In, First-Out memory queue.",
    cinebookUse: "Pushes seat selection logs to support single-action undo checks.",
    timeComp: "O(1)",
    spaceComp: "O(N)",
    pros: ["Constant time insertion/retrieval.", "Simple LIFO layout."],
    cons: ["No random access index support."]
  },
  queue: {
    name: "Queue (FIFO Buffer)",
    purpose: "First-In, First-Out memory buffer.",
    cinebookUse: "Queues concurrent incoming API checkout requests to prevent database lock contention.",
    timeComp: "O(1)",
    spaceComp: "O(N)",
    pros: ["Fair resource scheduling (First Come, First Served)."],
    cons: ["No index query support."]
  },
  hashmap: {
    name: "Hash Map (Collision Chains)",
    purpose: "Constant-time key-value database mapping.",
    cinebookUse: "Enforces instant ticket hash code gate validation during cinema check-in.",
    timeComp: "O(1) Avg",
    spaceComp: "O(N + B)",
    pros: ["Guarantees constant-time ticket retrieval.", "Chaining resolves collisions."],
    cons: ["Hash collision spikes slow lookups to O(N) worst case."]
  },
  greedy: {
    name: "Greedy Seat Allocator",
    purpose: "Locally optimal selection logic.",
    cinebookUse: "Allocates available seats closest to center line coordinates.",
    timeComp: "O(N log N)",
    spaceComp: "O(N)",
    pros: ["Extremely simple.", "Instantly returns center-most seats."],
    cons: ["Cannot guarantee group seats are placed side-by-side."]
  },
  backtracking: {
    name: "Adjacent Seat Finder (Backtracking)",
    purpose: "Exhaustive recursive constraint solver.",
    cinebookUse: "Searches all candidate combinations to seat groups together.",
    timeComp: "O(C(M, K)) - Exponential",
    spaceComp: "O(K) stack depth",
    pros: ["Guarantees finding the best clustered seats.", "Prunes invalid configurations early."],
    cons: ["Extremely slow if candidates list size exceeds safe bounds."]
  },
  mutex: {
    name: "Mutex Lock",
    purpose: "Mutual Exclusion locking primitive.",
    cinebookUse: "Enforces single-transaction locks to prevent double seat booking.",
    timeComp: "O(1)",
    spaceComp: "O(Q) queue wait",
    pros: ["Eliminates double bookings.", "Guarantees resource safety."],
    cons: ["Can induce deadlocks or bottleneck throughput if threads hang."]
  },
  semaphore: {
    name: "Semaphore permits Throttle",
    purpose: "Connection limits capacity manager.",
    cinebookUse: "Limits simultaneous REST requests inside checkout simulation gateway.",
    timeComp: "O(1)",
    spaceComp: "O(Q) queue wait",
    pros: ["Controls system capacity limits.", "Supports concurrent access flows."],
    cons: ["Incorrect counts generate resource leaks."]
  }
};

export default function Dashboard() {
  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [stepData, setStepData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [lineHighlight, setLineHighlight] = useState<number>(-1);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    resetPlayer();
    return () => {
      stopPlayback();
    };
  }, [selectedAlgo]);

  const stopPlayback = () => {
    setIsPlaying(false);
  };

  const createGenerator = (algo: string): Generator<any, any, any> => {
    switch (algo) {
      case 'dijkstra': {
        const g = new Graph();
        g.addVertex({ id: 'A', name: 'Start', x: 10, y: 15 });
        g.addVertex({ id: 'B', name: 'Node B', x: 30, y: 10 });
        g.addVertex({ id: 'C', name: 'Node C', x: 50, y: 35 });
        g.addVertex({ id: 'D', name: 'End', x: 75, y: 15 });
        g.addEdge('A', 'B', 8);
        g.addEdge('A', 'C', 15);
        g.addEdge('B', 'C', 5);
        g.addEdge('C', 'D', 6);
        g.addEdge('B', 'D', 14);
        return Dijkstra.runGenerator(g, 'A', 'D');
      }
      case 'astar': {
        const g = new Graph();
        g.addVertex({ id: 'A', name: 'Start', x: 10, y: 25 });
        g.addVertex({ id: 'B', name: 'Node B', x: 35, y: 15 });
        g.addVertex({ id: 'C', name: 'Node C', x: 50, y: 40 });
        g.addVertex({ id: 'D', name: 'End', x: 75, y: 25 });
        g.addEdge('A', 'B', 10);
        g.addEdge('A', 'C', 18);
        g.addEdge('B', 'C', 5);
        g.addEdge('C', 'D', 8);
        g.addEdge('B', 'D', 15);
        return AStar.runGenerator(g, 'A', 'D');
      }
      case 'linearsearch': {
        const array = [12, 24, 35, 48, 59, 72, 85, 96];
        function* runLinearSearch() {
          const target = 59;
          for (let i = 0; i < array.length; i++) {
            yield {
              array,
              currentIndex: i,
              comparing: true,
              found: array[i] === target,
              variables: { target, index: i, value: array[i] },
              explanation: `Checking index ${i}: comparing ${array[i]} with target ${target}.`
            };
            if (array[i] === target) {
              yield {
                array,
                currentIndex: i,
                comparing: false,
                found: true,
                variables: { target, foundIndex: i },
                explanation: `FOUND! Target ${target} located at index ${i}.`
              };
              return;
            }
          }
        }
        return runLinearSearch();
      }
      case 'binarysearch': {
        const array = [12, 24, 35, 48, 59, 72, 85, 96];
        function* runBinarySearch() {
          const target = 59;
          let low = 0;
          let high = array.length - 1;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            yield {
              array,
              low,
              high,
              mid,
              found: array[mid] === target,
              variables: { target, low, high, mid, midVal: array[mid] },
              explanation: `Checking mid index ${mid} (value ${array[mid]}). Range: [${low}, ${high}].`
            };
            if (array[mid] === target) {
              yield {
                array,
                low,
                high,
                mid,
                found: true,
                variables: { target, foundIndex: mid },
                explanation: `FOUND! Target ${target} located at midpoint index ${mid}.`
              };
              return;
            }
            if (array[mid] < target) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
        }
        return runBinarySearch();
      }
      case 'mergesort': {
        const array = [7, 2, 9, 3, 5];
        return MergeSort.runGenerator(array, (a, b) => a - b);
      }
      case 'quicksort': {
        const array = [8, 3, 5, 2, 7];
        return QuickSort.runGenerator(array, (a, b) => a - b);
      }
      case 'heapsort': {
        const array = [6, 2, 8, 4, 7];
        return HeapSort.runGenerator(array, (a, b) => a - b);
      }
      case 'binarytree': {
        const tree = new BinaryTree<number>();
        tree.insert(1);
        tree.insert(2);
        tree.insert(3);
        tree.insert(4);
        tree.insert(5);
        return tree.levelOrderGenerator();
      }
      case 'bst': {
        const bst = new BinarySearchTree<number>((a, b) => a - b);
        bst.insert(5);
        bst.insert(3);
        bst.insert(8);
        return bst.insertGenerator(4);
      }
      case 'minheap': {
        const heap = new MinHeap<number>((a, b) => a - b);
        function* runMinHeap() {
          yield* heap.insertGenerator(15);
          yield* heap.insertGenerator(8);
          yield* heap.insertGenerator(22);
          yield* heap.insertGenerator(5);
          yield* heap.extractMinGenerator();
        }
        return runMinHeap();
      }
      case 'stack': {
        const undoStack = new UndoSeatSelection<string>();
        function* runStack() {
          yield* undoStack.pushGenerator('A1');
          yield* undoStack.pushGenerator('A2');
          yield* undoStack.pushGenerator('B3');
          yield* undoStack.popGenerator();
          yield* undoStack.popGenerator();
        }
        return runStack();
      }
      case 'queue': {
        const q = new BookingQueue<string>();
        function* runQueue() {
          yield* q.enqueueGenerator('Alice');
          yield* q.enqueueGenerator('Bob');
          yield* q.enqueueGenerator('Charlie');
          yield* q.dequeueGenerator();
          yield* q.dequeueGenerator();
        }
        return runQueue();
      }
      case 'hashmap': {
        const map = new BookingHashMap<string, string>(8);
        function* runHashMap() {
          yield* map.putGenerator('KEY1', 'Alice');
          yield* map.putGenerator('KEY2', 'Bob');
          yield* map.putGenerator('KEY1', 'Charlie'); // Collision / update
          yield* map.getGenerator('KEY2');
        }
        return runHashMap();
      }
      case 'greedy': {
        const grid: Seat[][] = [];
        for (let r = 0; r < 3; r++) {
          grid.push([]);
          for (let c = 0; c < 4; c++) {
            grid[r].push({
              row: r,
              col: c,
              label: `${String.fromCharCode(65 + r)}${c + 1}`,
              isBooked: r === 1 && c === 2
            });
          }
        }
        return SeatAllocator.allocateGenerator(grid, 3);
      }
      case 'backtracking': {
        const grid: Seat[][] = [];
        for (let r = 0; r < 3; r++) {
          grid.push([]);
          for (let c = 0; c < 3; c++) {
            grid[r].push({
              row: r,
              col: c,
              label: `${String.fromCharCode(65 + r)}${c + 1}`,
              isBooked: r === 1
            });
          }
        }
        return AdjacentSeatFinder.findGenerator(grid, 3);
      }
      case 'mutex': {
        const m = new Mutex();
        function* runMutexSim() {
          const acqGen1 = m.acquireGenerator('Alice');
          let s1 = acqGen1.next();
          while (!s1.done) { yield s1.value; s1 = acqGen1.next(); }

          const acqGen2 = m.acquireGenerator('Bob');
          let s2 = acqGen2.next();
          while (!s2.done) { yield s2.value; s2 = acqGen2.next(); }

          const relGen1 = m.releaseGenerator();
          let s3 = relGen1.next();
          while (!s3.done) { yield s3.value; s3 = relGen1.next(); }
        }
        return runMutexSim();
      }
      case 'semaphore': {
        const sem = new Semaphore(2);
        function* runSemSim() {
          const g1 = sem.acquireGenerator('Alice');
          let s1 = g1.next(); while(!s1.done) { yield s1.value; s1 = g1.next(); }
          
          const g2 = sem.acquireGenerator('Bob');
          let s2 = g2.next(); while(!s2.done) { yield s2.value; s2 = g2.next(); }

          const g3 = sem.acquireGenerator('Charlie');
          let s3 = g3.next(); while(!s3.done) { yield s3.value; s3 = g3.next(); }

          const r1 = sem.releaseGenerator('Alice');
          let s4 = r1.next(); while(!s4.done) { yield s4.value; s4 = r1.next(); }

          const r2 = sem.releaseGenerator('Bob');
          let s5 = r2.next(); while(!s5.done) { yield s5.value; s5 = r2.next(); }
        }
        return runSemSim();
      }
      default:
        throw new Error('Unknown algorithm');
    }
  };

  const resetPlayer = () => {
    stopPlayback();
    const gen = createGenerator(selectedAlgo);
    playerRef.current = new AlgorithmPlayer<any, any>(gen);
    
    const { step } = playerRef.current.stepForward();
    setStepData(step);
    if (step?.explanation) {
      setLogs([step.explanation]);
    } else {
      setLogs([]);
    }
    setLineHighlight(0);
  };

  const handleNext = () => {
    if (!playerRef.current) return;
    const { step, done } = playerRef.current.stepForward();
    if (done) {
      stopPlayback();
      setLogs(prev => [...prev, "Algorithm completed successfully!"]);
      return;
    }
    if (step) {
      setStepData(step);
      setLogs(prev => [...prev, step.explanation]);
      setLineHighlight(prev => (prev + 1) % (CODE_SNIPPETS[selectedAlgo]?.length || 1));
    }
  };

  const handlePrev = () => {
    if (!playerRef.current) return;
    const { step } = playerRef.current.stepBackward();
    if (step) {
      setStepData(step);
      setLogs(prev => prev.slice(0, -1));
      setLineHighlight(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        handleNext();
      }, speed);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, speed]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTheory = THEORY_METADATA[selectedAlgo] || {
    name: 'Algorithm',
    purpose: '',
    cinebookUse: '',
    timeComp: 'O(1)',
    spaceComp: 'O(1)',
    pros: [],
    cons: []
  };

  // Helper to render MinHeap Tree visual coordinates
  const getHeapCoords = (idx: number) => {
    const coords = [
      { cx: 100, cy: 15 }, // Root
      { cx: 50, cy: 30 },  // Level 1 Left
      { cx: 150, cy: 30 }, // Level 1 Right
      { cx: 25, cy: 45 },  // Level 2 L-L
      { cx: 75, cy: 45 },  // Level 2 L-R
      { cx: 125, cy: 45 }, // Level 2 R-L
      { cx: 175, cy: 45 }, // Level 2 R-R
    ];
    return coords[idx] || { cx: 100, cy: 50 };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Visualizer Category selection tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-cinema-border">
        {Object.keys(THEORY_METADATA).map(key => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            className={`px-4.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap tracking-wide border transition-all duration-300 ${
              selectedAlgo === key
                ? 'bg-teal-400 border-teal-400 text-cinema-black glow-teal'
                : 'bg-cinema-card border-cinema-border text-slate-400 hover:text-white'
            }`}
          >
            {THEORY_METADATA[key].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visualizer canvas & log traces */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel border border-cinema-border rounded-2xl p-6 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-teal-400 font-bold uppercase tracking-[0.25em]">Live Execution Canvas</span>
                <span className="text-[9px] text-slate-500 font-mono">Status: {isPlaying ? 'Autoplay active' : 'Paused'}</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1 mb-6 uppercase tracking-wider">{currentTheory.name}</h3>

              {/* DYNAMIC CANVAS ACCORDING TO SELECTED DSA */}
              <div className="flex items-center justify-center py-6 min-h-[220px]">
                
                {/* 1. Sorting Bars */}
                {['mergesort', 'quicksort', 'heapsort'].includes(selectedAlgo) && stepData?.array && (
                  <div className="flex items-end gap-3 h-48 w-4/5 justify-center">
                    {stepData.array.map((val: number, idx: number) => {
                      const isComparing = stepData.comparingIndices?.includes(idx);
                      const isSwapping = stepData.swappingIndices?.includes(idx);
                      
                      let barColor = 'bg-slate-800 border-slate-700 text-slate-400';
                      if (isComparing) barColor = 'bg-red-500 border-red-400 text-red-100 glow-red animate-pulse';
                      if (isSwapping) barColor = 'bg-gold-500 border-gold-400 text-cinema-black glow-gold';

                      return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div
                            className={`w-10 rounded-t-lg border transition-all duration-300 flex items-center justify-center font-bold text-xs ${barColor}`}
                            style={{ height: `${val * 16}px` }}
                          >
                            {val}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Linear / Binary Search Index Visuals */}
                {['linearsearch', 'binarysearch'].includes(selectedAlgo) && stepData?.array && (
                  <div className="flex flex-col items-center gap-6 w-full max-w-md">
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      {stepData.array.map((val: number, idx: number) => {
                        const isCurrent = stepData.currentIndex === idx || stepData.mid === idx;
                        const isFound = stepData.found && isCurrent;
                        const inRange = stepData.low !== undefined ? (idx >= stepData.low && idx <= stepData.high) : true;

                        let blockColor = 'bg-slate-950 border-cinema-border text-slate-400';
                        if (!inRange) blockColor = 'bg-slate-950 border-cinema-border text-slate-650 opacity-30';
                        else if (isFound) blockColor = 'bg-teal-400 text-cinema-black border-teal-400 glow-teal font-extrabold';
                        else if (isCurrent) blockColor = 'bg-gold-500/20 border-gold-400 text-gold-400 glow-gold animate-pulse';

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5">
                            <div className={`w-11 h-11 border rounded-xl flex items-center justify-center text-xs transition-all duration-200 font-mono ${blockColor}`}>
                              {val}
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">[{idx}]</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Graphs Pathfinder */}
                {['dijkstra', 'astar'].includes(selectedAlgo) && (
                  <div className="w-full aspect-[2/1] max-w-[400px]">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      {/* Edges */}
                      <line x1="10" y1="15" x2="30" y2="10" stroke={stepData?.relaxingNode === 'B' ? '#fbbf24' : '#1f1f26'} strokeWidth="1" />
                      <line x1="10" y1="15" x2="50" y2="35" stroke={stepData?.relaxingNode === 'C' ? '#fbbf24' : '#1f1f26'} strokeWidth="1" />
                      <line x1="30" y1="10" x2="50" y2="35" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="50" y1="35" x2="75" y2="15" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="30" y1="10" x2="75" y2="15" stroke="#1f1f26" strokeWidth="1" />

                      {/* Nodes */}
                      <circle cx="10" cy="15" r="4" fill="#fbbf24" />
                      <text x="10" y="23" textAnchor="middle" fill="#fbbf24" className="text-[3px] font-bold">Start (A)</text>

                      <circle cx="30" cy="10" r="4" fill={stepData?.currentNode === 'B' ? '#00ffd1' : stepData?.visited?.includes('B') ? '#00e1b9' : '#1e293b'} />
                      <text x="30" y="18" textAnchor="middle" fill="#94a3b8" className="text-[3px]">Node B</text>

                      <circle cx="50" cy="35" r="4" fill={stepData?.currentNode === 'C' ? '#00ffd1' : stepData?.visited?.includes('C') ? '#00e1b9' : '#1e293b'} />
                      <text x="50" y="43" textAnchor="middle" fill="#94a3b8" className="text-[3px]">Node C</text>

                      <circle cx="75" cy="15" r="4" fill={stepData?.currentNode === 'D' ? '#00ffd1' : stepData?.visited?.includes('D') ? '#00e1b9' : '#1e293b'} />
                      <text x="75" y="23" textAnchor="middle" fill="#94a3b8" className="text-[3px]">End (D)</text>
                    </svg>
                  </div>
                )}

                {/* 4. Binary Tree Traversal */}
                {selectedAlgo === 'binarytree' && stepData?.treeState && (
                  <div className="w-full max-w-[320px]">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      <line x1="50" y1="10" x2="25" y2="25" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="50" y1="10" x2="75" y2="25" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="25" y1="25" x2="12" y2="40" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="25" y1="25" x2="38" y2="40" stroke="#1f1f26" strokeWidth="1" />

                      <circle cx="50" cy="10" r="5" fill={stepData.currentNodeId === 1 ? '#00ffd1' : stepData.visitedNodes.includes(1) ? '#00e1b9' : '#1e293b'} />
                      <text x="50" y="11.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">1</text>

                      <circle cx="25" cy="25" r="5" fill={stepData.currentNodeId === 2 ? '#00ffd1' : stepData.visitedNodes.includes(2) ? '#00e1b9' : '#1e293b'} />
                      <text x="25" y="26.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">2</text>

                      <circle cx="75" cy="25" r="5" fill={stepData.currentNodeId === 3 ? '#00ffd1' : stepData.visitedNodes.includes(3) ? '#00e1b9' : '#1e293b'} />
                      <text x="75" y="26.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">3</text>

                      <circle cx="12" cy="40" r="5" fill={stepData.currentNodeId === 4 ? '#00ffd1' : stepData.visitedNodes.includes(4) ? '#00e1b9' : '#1e293b'} />
                      <text x="12" y="41.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">4</text>

                      <circle cx="38" cy="40" r="5" fill={stepData.currentNodeId === 5 ? '#00ffd1' : stepData.visitedNodes.includes(5) ? '#00e1b9' : '#1e293b'} />
                      <text x="38" y="41.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">5</text>
                    </svg>
                  </div>
                )}

                {/* 5. BST Insertion */}
                {selectedAlgo === 'bst' && stepData?.treeState && (
                  <div className="w-full max-w-[320px]">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <line x1="50" y1="10" x2="25" y2="25" stroke="#1f1f26" strokeWidth="1" />
                      <line x1="50" y1="10" x2="75" y2="25" stroke="#1f1f26" strokeWidth="1" />
                      {stepData.treeState.left?.left && <line x1="25" y1="25" x2="38" y2="40" stroke="#1f1f26" strokeWidth="1" />}

                      <circle cx="50" cy="10" r="5" fill={stepData.compareNodeId === 5 ? '#fbbf24' : '#1e293b'} />
                      <text x="50" y="11.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">5</text>

                      <circle cx="25" cy="25" r="5" fill={stepData.compareNodeId === 3 ? '#fbbf24' : '#1e293b'} />
                      <text x="25" y="26.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">3</text>

                      <circle cx="75" cy="25" r="5" fill={stepData.compareNodeId === 8 ? '#fbbf24' : '#1e293b'} />
                      <text x="75" y="26.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">8</text>

                      {stepData.treeState.left?.left && (
                        <>
                          <circle cx="38" cy="40" r="5" fill={stepData.currentNodeId === 4 ? '#00ffd1' : '#1e293b'} />
                          <text x="38" y="41.5" textAnchor="middle" fill="white" className="text-[4px] font-bold">4</text>
                        </>
                      )}
                    </svg>
                  </div>
                )}

                {/* 6. Min Heap Tree Structure */}
                {selectedAlgo === 'minheap' && stepData?.heapState && (
                  <div className="w-full max-w-[340px]">
                    <svg viewBox="0 0 200 60" className="w-full h-full">
                      {/* Lines */}
                      {stepData.heapState.length > 1 && <line x1="100" y1="15" x2="50" y2="30" stroke="#1f1f26" strokeWidth="1" />}
                      {stepData.heapState.length > 2 && <line x1="100" y1="15" x2="150" y2="30" stroke="#1f1f26" strokeWidth="1" />}
                      {stepData.heapState.length > 3 && <line x1="50" y1="30" x2="25" y2="45" stroke="#1f1f26" strokeWidth="1" />}
                      {stepData.heapState.length > 4 && <line x1="50" y1="30" x2="75" y2="45" stroke="#1f1f26" strokeWidth="1" />}
                      {stepData.heapState.length > 5 && <line x1="150" y1="30" x2="125" y2="45" stroke="#1f1f26" strokeWidth="1" />}
                      {stepData.heapState.length > 6 && <line x1="150" y1="30" x2="175" y2="45" stroke="#1f1f26" strokeWidth="1" />}

                      {/* Nodes */}
                      {stepData.heapState.map((val: any, idx: number) => {
                        const { cx, cy } = getHeapCoords(idx);
                        return (
                          <g key={idx}>
                            <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                            <text x={cx} y={cy + 1.5} textAnchor="middle" fill="white" className="text-[5px] font-bold">{val}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* 7. Stack History visual */}
                {selectedAlgo === 'stack' && stepData?.stack && (
                  <div className="flex flex-col gap-2 items-center justify-end h-44 w-32 border-2 border-dashed border-cinema-border rounded-2xl bg-cinema-black/40 p-4">
                    {stepData.stack.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-full py-2 bg-gold-500/10 border border-gold-400 text-gold-400 text-[10px] font-mono font-bold text-center rounded-xl glow-gold animate-fade-in"
                      >
                        [{idx}]: {item}
                      </div>
                    ))}
                    {stepData.stack.length === 0 && (
                      <span className="text-[10px] text-slate-600 font-mono">Stack empty</span>
                    )}
                  </div>
                )}

                {/* 8. Queue Buffer Visual */}
                {selectedAlgo === 'queue' && stepData?.queue && (
                  <div className="flex items-center gap-2 border border-cinema-border p-5 rounded-2xl bg-cinema-black/50 overflow-x-auto w-full max-w-sm">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Rear</span>
                    {stepData.queue.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-3 py-2.5 bg-slate-900 border border-cinema-border font-bold text-xs rounded-xl text-slate-300 text-center shrink-0"
                      >
                        {item}
                      </div>
                    ))}
                    {stepData.queue.length === 0 && (
                      <span className="text-[10px] text-slate-600 font-mono italic">Queue empty</span>
                    )}
                    <span className="text-[9px] text-teal-400 uppercase tracking-widest font-mono font-bold ml-auto">Front</span>
                  </div>
                )}

                {/* 9. Hash Map Collision visual */}
                {selectedAlgo === 'hashmap' && stepData?.buckets && (
                  <div className="flex flex-col gap-2.5 w-full max-w-md max-h-[220px] overflow-y-auto pr-2">
                    {stepData.buckets.map((bucket: any[], bIdx: number) => {
                      const isHighlighted = stepData.bucketIndex === bIdx;
                      return (
                        <div key={bIdx} className={`flex items-center gap-3 p-1.5 rounded-lg border transition-all ${
                          isHighlighted ? 'bg-gold-500/10 border-gold-400 glow-gold' : 'border-cinema-border/50 bg-slate-950/20'
                        }`}>
                          <span className="w-12 text-[10px] font-mono text-slate-500 text-right">Bucket [{bIdx}]</span>
                          <div className="flex gap-2 items-center flex-wrap">
                            {bucket.map((entry: any, eIdx: number) => (
                              <div
                                key={eIdx}
                                className="px-2 py-1 bg-slate-900 border border-cinema-border rounded text-[9px] font-mono font-bold text-slate-300"
                              >
                                {entry.key}: "{entry.value}"
                              </div>
                            ))}
                            {bucket.length === 0 && (
                              <span className="text-[9px] text-slate-700 italic font-mono">Empty</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 10. Seating layout grid for Greedy / Backtracking */}
                {['greedy', 'backtracking'].includes(selectedAlgo) && stepData?.grid && (
                  <div className="flex flex-col gap-2 scale-90">
                    {stepData.grid.map((row: Seat[], rIdx: number) => (
                      <div key={rIdx} className="flex gap-2">
                        {row.map(seat => {
                          const isAllocated = stepData.allocatedSeats?.includes(seat.label) || stepData.bestCombination?.includes(seat.label);
                          const isCurrentCandidate = stepData.currentCombination?.includes(seat.label);
                          
                          let seatColor = 'bg-cinema-card border-cinema-border text-slate-500';
                          if (seat.isBooked && !isAllocated) seatColor = 'bg-slate-800/80 border-slate-900 text-slate-700';
                          if (isCurrentCandidate) seatColor = 'bg-teal-500/20 border-teal-400 text-teal-400 glow-teal';
                          if (isAllocated) seatColor = 'bg-gold-500 border-gold-400 text-cinema-black glow-gold';

                          return (
                            <div
                              key={seat.label}
                              className={`w-8 h-8 rounded border text-[10px] font-bold flex items-center justify-center transition-all ${seatColor}`}
                            >
                              {seat.label}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* 11. Concurrency locks visual (Mutex / Semaphore) */}
                {['mutex', 'semaphore'].includes(selectedAlgo) && (
                  <div className="flex flex-col gap-6 items-center w-full max-w-sm">
                    <div className="flex gap-4">
                      {/* Permit Box */}
                      {selectedAlgo === 'mutex' ? (
                        <div className={`p-5 rounded-2xl border flex flex-col items-center gap-1.5 w-44 ${
                          stepData?.locked ? 'bg-red-500/10 border-red-500 text-red-400 glow-red' : 'bg-teal-500/10 border-teal-500 text-teal-400 glow-teal'
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mutex Status</span>
                          <span className="text-base font-black">{stepData?.locked ? 'MUTEX LOCKED' : 'MUTEX FREE'}</span>
                          {stepData?.activeOwner && (
                            <span className="text-[10px] text-slate-300 font-mono mt-1">Holder: {stepData.activeOwner}</span>
                          )}
                        </div>
                      ) : (
                        <div className={`p-5 rounded-2xl border flex flex-col items-center gap-1.5 w-48 ${
                          stepData?.availablePermits === 0 ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-purple-500/10 border-purple-500 text-purple-400 glow-purple'
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Semaphore Permits</span>
                          <span className="text-base font-black">AVAILABLE: {stepData?.availablePermits} / {stepData?.capacity}</span>
                          {stepData?.activeOwners && stepData.activeOwners.length > 0 && (
                            <span className="text-[9px] text-slate-300 font-mono text-center mt-1">
                              Holders: {stepData.activeOwners.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Waiting queue list */}
                    <div className="w-full border border-cinema-border bg-slate-950 p-4 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Gate Waiting Queue:</span>
                      <div className="flex gap-2">
                        {stepData?.queue && stepData.queue.map((q: string, idx: number) => (
                          <span key={idx} className="text-[9px] bg-slate-900 border border-cinema-border px-2 py-1 rounded font-mono text-slate-300">
                            {q}
                          </span>
                        ))}
                        {(!stepData?.queue || stepData.queue.length === 0) && (
                          <span className="text-[10px] text-slate-650 font-mono italic">Queue empty</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer playback buttons */}
            <div className="border-t border-cinema-border pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-28 accent-teal-400 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-500">{speed}ms stagger delay</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={resetPlayer}
                  className="p-2.5 rounded-lg bg-cinema-black hover:bg-slate-900 border border-cinema-border text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-lg bg-cinema-black hover:bg-slate-900 border border-cinema-border text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className={`p-3 rounded-full text-cinema-black transition-all ${
                    isPlaying ? 'bg-gold-400 glow-gold hover:bg-gold-300' : 'bg-teal-400 glow-teal hover:bg-teal-300'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-cinema-black" /> : <Play className="w-4 h-4 fill-cinema-black" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-lg bg-cinema-black hover:bg-slate-900 border border-cinema-border text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Trace Logger Console */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5 max-h-[190px] overflow-y-auto">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-teal-400" /> Trace Console Logs
            </h4>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-400">
              {logs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-teal-400 pl-2 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code snippets, Variable Inspector, and Complexity Info */}
        <div className="flex flex-col gap-6">
          {/* Pseudocode panel */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5 font-mono text-[11px] text-slate-400 max-h-[300px] overflow-y-auto">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Pseudocode Viewer</h4>
            <div className="space-y-1">
              {CODE_SNIPPETS[selectedAlgo]?.map((line, idx) => {
                const isHighlighted = idx === lineHighlight;
                return (
                  <div
                    key={idx}
                    className={`pl-3.5 py-1 whitespace-pre leading-relaxed rounded ${
                      isHighlighted ? 'code-highlight-line text-white font-bold' : ''
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* VARIABLE INSPECTOR PANEL */}
          {stepData?.variables && (
            <div className="glass-panel border border-cinema-border rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1">
                <Code className="w-4 h-4 text-gold-400" /> Variable Inspector
              </h4>
              <pre className="text-[10px] font-mono text-teal-400 bg-slate-950 p-3.5 rounded-xl border border-cinema-border overflow-x-auto">
                {JSON.stringify(stepData.variables, null, 2)}
              </pre>
            </div>
          )}

          {/* Specifications Panel */}
          <div className="glass-panel border border-cinema-border rounded-2xl p-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-gold-400" /> Complexity Analysis
            </h4>

            <div className="space-y-4 text-xs font-light leading-relaxed text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Time & Space Bounds</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-cinema-black border border-cinema-border px-3 py-1.5 rounded-lg font-mono">
                    Time: <span className="text-teal-400 font-bold">{currentTheory.timeComp}</span>
                  </div>
                  <div className="bg-cinema-black border border-cinema-border px-3 py-1.5 rounded-lg font-mono">
                    Space: <span className="text-gold-400 font-bold">{currentTheory.spaceComp}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">CineBook Showcase</span>
                <p className="mt-1 text-slate-350 font-normal leading-relaxed">{currentTheory.cinebookUse}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-cinema-border/50 pt-3">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Advantages</span>
                  <ul className="list-disc list-inside mt-1.5 space-y-1.5 pl-1 text-[11px]">
                    {currentTheory.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Limitations</span>
                  <ul className="list-disc list-inside mt-1.5 space-y-1.5 pl-1 text-[11px]">
                    {currentTheory.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
