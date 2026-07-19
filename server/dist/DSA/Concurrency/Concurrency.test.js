"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Mutex_1 = require("./Mutex");
const Semaphore_1 = require("./Semaphore");
(0, vitest_1.describe)('Concurrency Control', () => {
    (0, vitest_1.it)('should enforce Mutex exclusion locks', async () => {
        const mutex = new Mutex_1.Mutex();
        const logs = [];
        async function task(name) {
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
        (0, vitest_1.expect)(logs[0]).toBe('UserA acquired');
        (0, vitest_1.expect)(logs[1]).toBe('UserA releasing');
        (0, vitest_1.expect)(logs[2]).toBe('UserB acquired');
        (0, vitest_1.expect)(logs[3]).toBe('UserB releasing');
    });
    (0, vitest_1.it)('should enforce Semaphore concurrent connections limit', async () => {
        const sem = new Semaphore_1.Semaphore(2);
        const logs = [];
        async function task(name) {
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
        (0, vitest_1.expect)(firstTwoAcquired).toContain('UserA acquired');
        (0, vitest_1.expect)(firstTwoAcquired).toContain('UserB acquired');
        // Ensure UserC did not acquire before at least one release happened
        const acquisitionIndexC = logs.indexOf('UserC acquired');
        const releaseIndexes = [logs.indexOf('UserA releasing'), logs.indexOf('UserB releasing')];
        (0, vitest_1.expect)(acquisitionIndexC).toBeGreaterThan(Math.min(...releaseIndexes));
    });
});
