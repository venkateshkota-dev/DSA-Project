"use strict";
/**
 * Algorithm/Data Structure Name: Counting Semaphore
 *
 * Purpose:
 * A synchronization variable used to control access to a common resource by multiple processes
 * in a concurrent system, supporting a set number of concurrent permits.
 *
 * CineBook Use Case:
 * Limits simultaneous checkout connections. For instance, if the booking gateway has a capacity
 * limit of 3 concurrent checkout connections, a Semaphore(3) throttles concurrent checkouts.
 * Additional checkout requests are queued and processed as active checkout sessions finish and release permits.
 *
 * Real-world Applications:
 * - Connection pooling in databases (max database connections)
 * - Rate limiters in API gateways (max concurrent requests)
 * - Thread pool sizing limits
 *
 * Time Complexity:
 * - Acquire (Wait): O(1)
 * - Release (Signal): O(1)
 *
 * Space Complexity:
 * - O(Q) where Q is the number of queued processes waiting for an available permit.
 *
 * Advantages:
 * - Allows multiple concurrent accesses up to a specific capacity limit (unlike Mutex which allows only 1).
 * - Prevents system crashes from traffic surges.
 *
 * Limitations:
 * - Complex lock management; incorrect release counts can cause leaks or deadlocks.
 *
 * Pseudocode:
 * class Semaphore:
 *   permits = capacity
 *   queue = []
 *
 *   function acquire():
 *     if permits > 0:
 *       permits--
 *       return resolved promise
 *     promise = new promise()
 *     queue.push(promise.resolver)
 *     return promise
 *
 *   function release():
 *     if queue has items:
 *       resolveNext = queue.shift()
 *       resolveNext()
 *     else:
 *       permits++
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semaphore = void 0;
class Semaphore {
    capacity;
    availablePermits;
    queue = [];
    activeOwners = [];
    constructor(capacity) {
        this.capacity = capacity;
        this.availablePermits = capacity;
    }
    getAvailablePermits() {
        return this.availablePermits;
    }
    getWaitingQueue() {
        return this.queue.map(q => q.owner);
    }
    getActiveOwners() {
        return [...this.activeOwners];
    }
    /**
     * Acquires a permit. Returns a promise that resolves when the permit is acquired.
     */
    acquire(ownerName) {
        if (this.availablePermits > 0) {
            this.availablePermits--;
            this.activeOwners.push(ownerName);
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.queue.push({ owner: ownerName, resolve });
        });
    }
    /**
     * Releases a permit, letting the next queued thread proceed.
     */
    release(ownerName) {
        const ownerIdx = this.activeOwners.indexOf(ownerName);
        if (ownerIdx !== -1) {
            this.activeOwners.splice(ownerIdx, 1);
        }
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.activeOwners.push(next.owner);
            next.resolve();
        }
        else {
            this.availablePermits = Math.min(this.capacity, this.availablePermits + 1);
        }
    }
    /**
     * Generator-based acquire for visualization.
     */
    *acquireGenerator(ownerName) {
        yield {
            capacity: this.capacity,
            availablePermits: this.availablePermits,
            waitingQueueLength: this.queue.length,
            activeOwners: [...this.activeOwners],
            explanation: `User "${ownerName}" requesting semaphore permit. Available permits: ${this.availablePermits}/${this.capacity}.`,
            queue: this.getWaitingQueue()
        };
        if (this.availablePermits > 0) {
            this.availablePermits--;
            this.activeOwners.push(ownerName);
            yield {
                capacity: this.capacity,
                availablePermits: this.availablePermits,
                waitingQueueLength: this.queue.length,
                activeOwners: [...this.activeOwners],
                explanation: `Permit granted! User "${ownerName}" acquired a permit. Active connections: ${this.activeOwners.join(', ')}. Available permits: ${this.availablePermits}.`,
                queue: this.getWaitingQueue()
            };
            return true;
        }
        let resolved = false;
        const resolveFn = () => { resolved = true; };
        this.queue.push({ owner: ownerName, resolve: resolveFn });
        yield {
            capacity: this.capacity,
            availablePermits: this.availablePermits,
            waitingQueueLength: this.queue.length,
            activeOwners: [...this.activeOwners],
            explanation: `No permits available. User "${ownerName}" added to the waiting queue at position ${this.queue.length}.`,
            queue: this.getWaitingQueue()
        };
        return false;
    }
    /**
     * Generator-based release for visualization.
     */
    *releaseGenerator(ownerName) {
        const ownerIdx = this.activeOwners.indexOf(ownerName);
        if (ownerIdx !== -1) {
            this.activeOwners.splice(ownerIdx, 1);
        }
        yield {
            capacity: this.capacity,
            availablePermits: this.availablePermits,
            waitingQueueLength: this.queue.length,
            activeOwners: [...this.activeOwners],
            explanation: `User "${ownerName}" released permit. Active connections left: ${this.activeOwners.join(', ') || 'None'}. Checking queue.`,
            queue: this.getWaitingQueue()
        };
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.activeOwners.push(next.owner);
            next.resolve();
            yield {
                capacity: this.capacity,
                availablePermits: this.availablePermits,
                waitingQueueLength: this.queue.length,
                activeOwners: [...this.activeOwners],
                explanation: `Queue contains waiting users. Handed permit to queued user "${next.owner}". Active connections: ${this.activeOwners.join(', ')}.`,
                queue: this.getWaitingQueue()
            };
        }
        else {
            this.availablePermits = Math.min(this.capacity, this.availablePermits + 1);
            yield {
                capacity: this.capacity,
                availablePermits: this.availablePermits,
                waitingQueueLength: 0,
                activeOwners: [...this.activeOwners],
                explanation: `Queue is empty. Permit returned. Available permits: ${this.availablePermits}/${this.capacity}.`,
                queue: []
            };
        }
    }
}
exports.Semaphore = Semaphore;
