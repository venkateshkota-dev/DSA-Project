/**
 * Algorithm/Data Structure Name: Min-Heap
 * 
 * Purpose:
 * A binary tree structure where each parent node is smaller than or equal to its children.
 * The root node is always the minimum element in the heap.
 * 
 * CineBook Use Case:
 * Used to rank shows and seats by price, helping retrieve the lowest-priced tickets in logarithmic time O(log N).
 * 
 * Real-world Applications:
 * - Load balancing in server grids
 * - Efficient priority messaging queues
 * - Operating System task scheduler
 * 
 * Time Complexity:
 * - Insert: O(log N)
 * - Extract Min (Pop): O(log N)
 * - Peek Min: O(1)
 * - Heapify / Build: O(N)
 * 
 * Space Complexity:
 * - O(N) where N is the number of elements stored.
 * 
 * Advantages:
 * - Guarantees O(1) retrieval of the minimum element.
 * - Logarithmic insertion and removal times.
 * - Can be compactly represented using a flat array.
 * 
 * Limitations:
 * - Searching for an arbitrary element is O(N).
 * - Not sorted; only guarantees parent-child ordering.
 * 
 * Pseudocode:
 * function insert(val):
 *   array.append(val)
 *   bubbleUp(array.size - 1)
 * 
 * function bubbleUp(index):
 *   while index > 0 and array[parent(index)] > array[index]:
 *     swap(parent(index), index)
 *     index = parent(index)
 */

export interface HeapStep {
  heap: any[];
  variables: Record<string, any>;
  explanation: string;
}

export class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  getHeap(): T[] {
    return [...this.heap];
  }

  size(): number {
    return this.heap.length;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  private getParentIndex(i: number): number { return Math.floor((i - 1) / 2); }
  private getLeftChildIndex(i: number): number { return 2 * i + 1; }
  private getRightChildIndex(i: number): number { return 2 * i + 2; }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Standard insertion.
   */
  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = this.getParentIndex(index);
      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
        this.swap(index, parentIdx);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  /**
   * Standard extract minimum.
   */
  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  private bubbleDown(index: number): void {
    const size = this.heap.length;
    while (true) {
      let smallest = index;
      const left = this.getLeftChildIndex(index);
      const right = this.getRightChildIndex(index);

      if (left < size && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < size && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Generator-based insert for visualization.
   */
  *insertGenerator(value: T): Generator<HeapStep, void, unknown> {
    this.heap.push(value);
    let index = this.heap.length - 1;
    yield {
      heap: [...this.heap],
      variables: { index, value },
      explanation: `Inserted ${JSON.stringify(value)} at the end of the array representation.`
    };

    while (index > 0) {
      const parentIdx = this.getParentIndex(index);
      yield {
        heap: [...this.heap],
        variables: { index, parentIdx, parentVal: this.heap[parentIdx], currentVal: this.heap[index] },
        explanation: `Comparing child at index ${index} with parent at index ${parentIdx}.`
      };

      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
        this.swap(index, parentIdx);
        yield {
          heap: [...this.heap],
          variables: { index: parentIdx, swappedWith: index },
          explanation: `Swapped child and parent since child has smaller value.`
        };
        index = parentIdx;
      } else {
        yield {
          heap: [...this.heap],
          variables: { index },
          explanation: `Parent is already smaller or equal. Heap property restored.`
        };
        break;
      }
    }
  }

  /**
   * Generator-based extractMin for visualization.
   */
  *extractMinGenerator(): Generator<HeapStep, T | undefined, unknown> {
    if (this.heap.length === 0) {
      yield { heap: [], variables: {}, explanation: "Heap is empty. Nothing to extract." };
      return undefined;
    }
    if (this.heap.length === 1) {
      const min = this.heap.pop()!;
      yield { heap: [], variables: { min }, explanation: `Extracted the only element: ${JSON.stringify(min)}.` };
      return min;
    }

    const min = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;
    let index = 0;

    yield {
      heap: [...this.heap],
      variables: { min, replacedRootWith: last },
      explanation: `Extracted root: ${JSON.stringify(min)}. Moved last element: ${JSON.stringify(last)} to the root.`
    };

    const size = this.heap.length;
    while (true) {
      let smallest = index;
      const left = this.getLeftChildIndex(index);
      const right = this.getRightChildIndex(index);

      yield {
        heap: [...this.heap],
        variables: { index, left, right, smallest },
        explanation: `Checking child nodes of index ${index} (left: ${left}, right: ${right}).`
      };

      if (left < size && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < size && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        yield {
          heap: [...this.heap],
          variables: { index: smallest, swappedWith: index },
          explanation: `Swapped index ${index} with child at index ${smallest} to restore min-heap properties.`
        };
        index = smallest;
      } else {
        yield {
          heap: [...this.heap],
          variables: { index },
          explanation: `Heap property is restored. Extraction completed.`
        };
        break;
      }
    }

    return min;
  }
}
