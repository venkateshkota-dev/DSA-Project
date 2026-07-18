/**
 * Algorithm/Data Structure Name: Stack (Last-In, First-Out - LIFO)
 * 
 * Purpose:
 * A linear data structure that follows the Last-In, First-Out (LIFO) principle. 
 * The last element inserted is the first one to be removed.
 * 
 * CineBook Use Case:
 * Implements Undo Seat Selection. As the user selects seats in the layout grid, the actions are 
 * pushed to the stack. Clicking the "Undo" button pops the last action off the stack and reverses it.
 * 
 * Real-world Applications:
 * - Browser navigation history (Back button)
 * - Undo/Redo mechanisms in text editors (e.g. VS Code, MS Word)
 * - Expression parsing and syntax parsing (compilers)
 * - Function call stack execution in runtime environments
 * 
 * Time Complexity:
 * - Push: O(1)
 * - Pop: O(1)
 * - Peek: O(1)
 * 
 * Space Complexity:
 * - O(N) where N is the number of historical actions stored.
 * 
 * Advantages:
 * - Constant-time O(1) push and pop operations.
 * - Simple memory layout and control flow.
 * 
 * Limitations:
 * - Lacks random access lookup; must pop elements to access deeper values.
 * - Sized limits in fixed array structures.
 * 
 * Pseudocode:
 * class Stack:
 *   items = []
 *   function push(val):
 *     items.append(val)
 *   function pop():
 *     if isEmpty(): return error
 *     return items.removeLast()
 */

export interface StackStep<T> {
  stack: T[];
  variables: Record<string, any>;
  explanation: string;
}

export class UndoSeatSelection<T> {
  private items: T[] = [];

  constructor() {}

  push(element: T): void {
    this.items.push(element);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  getStack(): T[] {
    return [...this.items];
  }

  /**
   * Generator-based Push for visualization.
   */
  *pushGenerator(element: T): Generator<StackStep<T>, void, unknown> {
    this.items.push(element);
    yield {
      stack: [...this.items],
      variables: { element, size: this.items.length },
      explanation: `Pushed item ${JSON.stringify(element)} onto the stack.`
    };
  }

  /**
   * Generator-based Pop for visualization.
   */
  *popGenerator(): Generator<StackStep<T>, T | undefined, unknown> {
    if (this.isEmpty()) {
      yield {
        stack: [],
        variables: {},
        explanation: `Stack is empty. Pop operation is invalid.`
      };
      return undefined;
    }

    const element = this.items.pop()!;
    yield {
      stack: [...this.items],
      variables: { poppedElement: element, size: this.items.length },
      explanation: `Popped item ${JSON.stringify(element)} off the stack.`
    };
    return element;
  }
}
