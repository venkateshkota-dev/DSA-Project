import { describe, it, expect } from 'vitest';
import { Mutex } from './Mutex';
import { Semaphore } from './Semaphore';

describe('Concurrency Control', () => {
  it('should enforce Mutex exclusion locks', async () => {
    const mutex = new Mutex();
    const logs: string[] = [];

    async function task(name: string) {
      await mutex.acquire(name);
      logs.push(`${name} acquired`);
      // Simulate asynchronous work
      await new Promise(resolve => setTimeout(resolve, 5));
      logs.push(`${name} releasing`);
      mutex.release();
    }

    // Fire two tasks concurrently
    const p1 = task('UserA');
    const p2 = task('UserB');

    await Promise.all([p1, p2]);

    // Logs should show sequential acquisition
    expect(logs[0]).toBe('UserA acquired');
    expect(logs[1]).toBe('UserA releasing');
    expect(logs[2]).toBe('UserB acquired');
    expect(logs[3]).toBe('UserB releasing');
  });

  it('should enforce Semaphore concurrent connections limit', async () => {
    const sem = new Semaphore(2);
    const logs: string[] = [];

    async function task(name: string) {
      await sem.acquire(name);
      logs.push(`${name} acquired`);
      await new Promise(resolve => setTimeout(resolve, 5));
      logs.push(`${name} releasing`);
      sem.release(name);
    }

    // Fire 3 tasks concurrently. 2 should acquire immediately, 1 should wait.
    const p1 = task('UserA');
    const p2 = task('UserB');
    const p3 = task('UserC');

    await Promise.all([p1, p2, p3]);

    // Check first two acquired first, before third releasing
    const firstTwoAcquired = logs.slice(0, 2);
    expect(firstTwoAcquired).toContain('UserA acquired');
    expect(firstTwoAcquired).toContain('UserB acquired');
    // Ensure UserC did not acquire before at least one release happened
    const acquisitionIndexC = logs.indexOf('UserC acquired');
    const releaseIndexes = [logs.indexOf('UserA releasing'), logs.indexOf('UserB releasing')];
    expect(acquisitionIndexC).toBeGreaterThan(Math.min(...releaseIndexes));
  });
});
