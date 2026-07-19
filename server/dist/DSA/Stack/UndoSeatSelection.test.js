"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const UndoSeatSelection_1 = require("./UndoSeatSelection");
(0, vitest_1.describe)('Undo Seat Selection Stack', () => {
    (0, vitest_1.it)('should push, pop, and peek correctly', () => {
        const stack = new UndoSeatSelection_1.UndoSeatSelection();
        stack.push('E5');
        stack.push('E6');
        (0, vitest_1.expect)(stack.peek()).toBe('E6');
        (0, vitest_1.expect)(stack.pop()).toBe('E6');
        (0, vitest_1.expect)(stack.peek()).toBe('E5');
        (0, vitest_1.expect)(stack.size()).toBe(1);
    });
    (0, vitest_1.it)('should handle empty stack pops gracefully', () => {
        const stack = new UndoSeatSelection_1.UndoSeatSelection();
        (0, vitest_1.expect)(stack.pop()).toBeUndefined();
        (0, vitest_1.expect)(stack.isEmpty()).toBe(true);
    });
});
