import { describe, it, expect } from 'vitest';
import { UndoSeatSelection } from './UndoSeatSelection';

describe('Undo Seat Selection Stack', () => {
  it('should push, pop, and peek correctly', () => {
    const stack = new UndoSeatSelection<string>();
    stack.push('E5');
    stack.push('E6');

    expect(stack.peek()).toBe('E6');
    expect(stack.pop()).toBe('E6');
    expect(stack.peek()).toBe('E5');
    expect(stack.size()).toBe(1);
  });

  it('should handle empty stack pops gracefully', () => {
    const stack = new UndoSeatSelection<string>();
    expect(stack.pop()).toBeUndefined();
    expect(stack.isEmpty()).toBe(true);
  });
});
