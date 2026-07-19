"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const BookingHashMap_1 = require("./BookingHashMap");
(0, vitest_1.describe)('Booking HashMap', () => {
    (0, vitest_1.it)('should store and retrieve booking information by ID', () => {
        const map = new BookingHashMap_1.BookingHashMap();
        map.put('BK-101', { seats: ['E5', 'E6'], price: 300 });
        map.put('BK-102', { seats: ['A1'], price: 150 });
        const bk101 = map.get('BK-101');
        (0, vitest_1.expect)(bk101).toBeDefined();
        (0, vitest_1.expect)(bk101?.seats).toEqual(['E5', 'E6']);
        (0, vitest_1.expect)(map.get('BK-999')).toBeUndefined();
    });
    (0, vitest_1.it)('should handle collision chaining and updates correctly', () => {
        // Map with only 2 buckets to guarantee collisions
        const map = new BookingHashMap_1.BookingHashMap(2);
        map.put('KeyA', 'ValA');
        map.put('KeyB', 'ValB'); // Will likely land in one of the 2 buckets colliding
        map.put('KeyA', 'ValAUpdated');
        (0, vitest_1.expect)(map.get('KeyA')).toBe('ValAUpdated');
        (0, vitest_1.expect)(map.get('KeyB')).toBe('ValB');
    });
    (0, vitest_1.it)('should delete keys correctly', () => {
        const map = new BookingHashMap_1.BookingHashMap();
        map.put('KeyA', 'ValA');
        map.remove('KeyA');
        (0, vitest_1.expect)(map.get('KeyA')).toBeUndefined();
    });
});
