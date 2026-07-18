/**
 * Algorithm/Data Structure Name: Mutex (Mutual Exclusion Lock)
 * 
 * Purpose:
 * A synchronization primitive that limits access to a shared resource (e.g. seat booking transaction) 
 * to only one execution thread/process at a time.
 * 
 * CineBook Use Case:
 * Prevents double bookings. When multiple users click "Confirm Booking" for seat E6 simultaneously, 
 * the Mutex ensures only one request acquires the seat reservation lock at a time, checking seat 
 * availability and booking it, while subsequent requests are forced to wait and are rejected safely 
 * once the lock releases.
 * 
 * Real-world Applications:
 * - Thread synchronization in multi-threaded OS kernels
 * - Database row-level transaction locks
 * - Distributed service locks (Redis locks)
 * 
 * Time Complexity:
 * - Acquire Lock: O(1)
 * - Release Lock: O(1)
 * 
 * Space Complexity:
 * - O(Q) where Q is the number of concurrent processes queued up waiting for the lock.
 * 
 * Advantages:
 * - Completely eliminates double-booking race conditions.
 * - Straightforward locking model.
 * 
 * Limitations:
 * - Can cause performance bottlenecks if threads wait indefinitely.
 * - Danger of deadlock if locks are acquired out of order.
 * 
 * Pseudocode:
 * class Mutex:
 *   locked = false
 *   queue = []
 * 
 *   function acquire():
 *     if not locked:
 *       locked = true
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
 *       locked = false
 */

export interface MutexStep {
  locked: boolean;
  waitingQueueLength: number;
  activeOwner: string | null;
  explanation: string;
  queue: string[];
}

export class Mutex {
  private locked: boolean = false;
  private queue: { owner: string; resolve: () => void }[] = [];
  private currentOwner: string | null = null;

  constructor() {}

  isLocked(): boolean {
    return this.locked;
  }

  getCurrentOwner(): string | null {
    return this.currentOwner;
  }

  getWaitingQueue(): string[] {
    return this.queue.map(q => q.owner);
  }

  /**
   * Acquires the lock. Returns a promise that resolves when the lock is acquired.
   */
  acquire(ownerName: string): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      this.currentOwner = ownerName;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push({ owner: ownerName, resolve });
    });
  }

  /**
   * Releases the lock and hands it to the next waiting thread.
   */
  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.currentOwner = next.owner;
      next.resolve();
    } else {
      this.locked = false;
      this.currentOwner = null;
    }
  }

  /**
   * Generator-based Mutex execution for visualization.
   */
  *acquireGenerator(ownerName: string): Generator<MutexStep, boolean, unknown> {
    yield {
      locked: this.locked,
      waitingQueueLength: this.queue.length,
      activeOwner: this.currentOwner,
      explanation: `User "${ownerName}" requesting mutex lock. Lock status is currently ${this.locked ? 'LOCKED' : 'FREE'}.`,
      queue: this.getWaitingQueue()
    };

    if (!this.locked) {
      this.locked = true;
      this.currentOwner = ownerName;
      yield {
        locked: this.locked,
        waitingQueueLength: this.queue.length,
        activeOwner: this.currentOwner,
        explanation: `Lock was free! User "${ownerName}" successfully acquired the lock directly.`,
        queue: this.getWaitingQueue()
      };
      return true;
    }

    // Queue wait simulation step
    // Note: To make generators yield during async waits in actual code, we simulate the enqueue step.
    let resolved = false;
    const resolveFn = () => { resolved = true; };
    this.queue.push({ owner: ownerName, resolve: resolveFn });

    yield {
      locked: this.locked,
      waitingQueueLength: this.queue.length,
      activeOwner: this.currentOwner,
      explanation: `Lock is busy (held by "${this.currentOwner}"). User "${ownerName}" added to the lock waiting queue.`,
      queue: this.getWaitingQueue()
    };

    return false;
  }

  *releaseGenerator(): Generator<MutexStep, void, unknown> {
    const previousOwner = this.currentOwner;
    yield {
      locked: this.locked,
      waitingQueueLength: this.queue.length,
      activeOwner: this.currentOwner,
      explanation: `User "${previousOwner}" releasing lock. Checking waiting queue.`,
      queue: this.getWaitingQueue()
    };

    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.currentOwner = next.owner;
      next.resolve();

      yield {
        locked: this.locked,
        waitingQueueLength: this.queue.length,
        activeOwner: this.currentOwner,
        explanation: `Queue contains waiting users. Handed lock ownership from "${previousOwner}" to next in queue: "${this.currentOwner}".`,
        queue: this.getWaitingQueue()
      };
    } else {
      this.locked = false;
      this.currentOwner = null;

      yield {
        locked: this.locked,
        waitingQueueLength: 0,
        activeOwner: null,
        explanation: `Queue is empty. Lock is now fully FREE.`,
        queue: []
      };
    }
  }
}
