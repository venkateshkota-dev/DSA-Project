"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const BookingQueue_1 = require("./BookingQueue");
(0, vitest_1.describe)('Booking Queue', () => {
    (0, vitest_1.it)('should enqueue and dequeue in FIFO order', () => {
        const queue = new BookingQueue_1.BookingQueue();
        queue.enqueue('UserA');
        queue.enqueue('UserB');
        (0, vitest_1.expect)(queue.front()).toBe('UserA');
        (0, vitest_1.expect)(queue.rear()).toBe('UserB');
        (0, vitest_1.expect)(queue.dequeue()).toBe('UserA');
        (0, vitest_1.expect)(queue.front()).toBe('UserB');
        (0, vitest_1.expect)(queue.size()).toBe(1);
    });
});
