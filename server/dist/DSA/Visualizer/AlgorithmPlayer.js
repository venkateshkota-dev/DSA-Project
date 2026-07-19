"use strict";
/**
 * Algorithm/Data Structure Name: Algorithm Player (Visualization Engine)
 *
 * Purpose:
 * A playback control engine that manages step-by-step traversal of generators.
 * Caches steps in a history array to allow true bidirectional navigation (next and previous steps).
 *
 * CineBook Use Case:
 * Powers the Algorithms Dashboard visualizers. It wraps Dijkstra, BST, Sorts, Heap operations, etc.,
 * and handles UI playback controls (Play, Pause, Next, Prev, Reset, Speed) while updating state panels.
 *
 * Real-world Applications:
 * - IDE code debuggers (step-over, step-back)
 * - Educational visualizers (VisuAlgo, LeetCode Playback)
 * - Trace logging replay simulators
 *
 * Time Complexity:
 * - Next Step: O(1) (retrieving cached step, or generating one step)
 * - Previous Step: O(1) (retrieving cached step)
 * - Reset: O(1)
 *
 * Space Complexity:
 * - O(S) where S is the total number of execution steps (snapshots) generated.
 *
 * Advantages:
 * - Enables smooth, bug-free backward stepping.
 * - Decouples algorithm logic from React component rendering.
 *
 * Pseudocode:
 * class AlgorithmPlayer:
 *   history = []
 *   index = -1
 *   generator = null
 *
 *   function next():
 *     if index < history.length - 1:
 *       index++
 *       return history[index]
 *     res = generator.next()
 *     if not res.done:
 *       history.push(res.value)
 *       index++
 *       return res.value
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlgorithmPlayer = void 0;
class AlgorithmPlayer {
    generator;
    history = [];
    index = -1;
    isDone = false;
    finalResult = null;
    constructor(generator) {
        this.generator = generator;
    }
    /**
     * Returns true if there is a next step available or if the generator can produce one.
     */
    hasNext() {
        return this.index < this.history.length - 1 || !this.isDone;
    }
    /**
     * Returns true if there is a previous step in history.
     */
    hasPrevious() {
        return this.index > 0;
    }
    /**
     * Step forward in the algorithm.
     */
    stepForward() {
        if (this.index < this.history.length - 1) {
            this.index++;
            return { step: this.history[this.index], done: false, result: null };
        }
        if (this.isDone) {
            return { step: null, done: true, result: this.finalResult };
        }
        const nextVal = this.generator.next();
        if (nextVal.done) {
            this.isDone = true;
            this.finalResult = nextVal.value;
            return { step: null, done: true, result: this.finalResult };
        }
        const step = nextVal.value;
        this.history.push(step);
        this.index++;
        return { step, done: false, result: null };
    }
    /**
     * Step backward in the algorithm.
     */
    stepBackward() {
        if (this.index > 0) {
            this.index--;
            return { step: this.history[this.index], done: false };
        }
        return { step: null, done: false }; // Already at beginning
    }
    /**
     * Resets the player. Note: since generators cannot be restarted in-place,
     * the creator must supply a fresh generator to start over.
     */
    reset(newGenerator) {
        this.generator = newGenerator;
        this.history = [];
        this.index = -1;
        this.isDone = false;
        this.finalResult = null;
    }
    /**
     * Gets the current step index.
     */
    getCurrentIndex() {
        return this.index;
    }
    /**
     * Gets the total cached steps.
     */
    getHistoryLength() {
        return this.history.length;
    }
    /**
     * Checks if the execution has run to completion.
     */
    isCompleted() {
        return this.isDone;
    }
    /**
     * Gets the final returned value of the algorithm.
     */
    getFinalResult() {
        return this.finalResult;
    }
    /**
     * Gets the current active step snapshot.
     */
    getCurrentStep() {
        if (this.index >= 0 && this.index < this.history.length) {
            return this.history[this.index];
        }
        return null;
    }
}
exports.AlgorithmPlayer = AlgorithmPlayer;
