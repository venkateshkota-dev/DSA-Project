"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoSeatSelection = void 0;
class UndoSeatSelection {
    items = [];
    constructor() { }
    push(element) {
        this.items.push(element);
    }
    pop() {
        return this.items.pop();
    }
    peek() {
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    clear() {
        this.items = [];
    }
    getStack() {
        return [...this.items];
    }
    /**
     * Generator-based Push for visualization.
     */
    *pushGenerator(element) {
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
    *popGenerator() {
        if (this.isEmpty()) {
            yield {
                stack: [],
                variables: {},
                explanation: `Stack is empty. Pop operation is invalid.`
            };
            return undefined;
        }
        const element = this.items.pop();
        yield {
            stack: [...this.items],
            variables: { poppedElement: element, size: this.items.length },
            explanation: `Popped item ${JSON.stringify(element)} off the stack.`
        };
        return element;
    }
}
exports.UndoSeatSelection = UndoSeatSelection;
