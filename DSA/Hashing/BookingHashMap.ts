/**
 * Algorithm/Data Structure Name: Hash Map (Chaining Collision Resolution)
 * 
 * Purpose:
 * A data structure that maps keys to values for highly efficient lookup, insertion, and deletion.
 * Uses a hash function to compute an index into an array of buckets.
 * 
 * CineBook Use Case:
 * Stores booking records by their confirmation IDs, enabling instant O(1) ticket validation
 * at the theatre gate during check-in.
 * 
 * Real-world Applications:
 * - Database indexes
 * - Cache systems (Redis, Memcached)
 * - Compiler symbol tables
 * 
 * Time Complexity:
 * - Insert (Put): O(1) average, O(N) worst case (extreme hash collisions)
 * - Search (Get): O(1) average, O(N) worst case
 * - Delete: O(1) average, O(N) worst case
 * 
 * Space Complexity:
 * - O(N + B) where N is the number of entries and B is the number of buckets.
 * 
 * Advantages:
 * - Constant-time operations on average.
 * - Chaining handles high load factors gracefully.
 * 
 * Limitations:
 * - Hash function design is critical; poor hash functions lead to performance degradation.
 * - Lacks sorted order.
 * 
 * Pseudocode:
 * function put(key, value):
 *   index = hash(key) % bucketCount
 *   bucket = buckets[index]
 *   if key exists in bucket: update value
 *   else append {key, value} to bucket list
 */

export interface HashMapEntry<K, V> {
  key: K;
  value: V;
}

export interface HashMapStep {
  buckets: any[];
  hashValue: number;
  bucketIndex: number;
  variables: Record<string, any>;
  explanation: string;
}

export class BookingHashMap<K, V> {
  private size: number = 8; // Small size for easy visualization of buckets/collisions
  private buckets: HashMapEntry<K, V>[][] = [];

  constructor(size: number = 8) {
    this.size = size;
    for (let i = 0; i < size; i++) {
      this.buckets.push([]);
    }
  }

  /**
   * Custom DJB2-like string hash function.
   */
  private hash(key: any): number {
    const keyStr = String(key);
    let hashVal = 5381;
    for (let i = 0; i < keyStr.length; i++) {
      hashVal = (hashVal * 33) ^ keyStr.charCodeAt(i);
    }
    return Math.abs(hashVal);
  }

  /**
   * Standard insertion.
   */
  put(key: K, value: V): void {
    const hashVal = this.hash(key);
    const index = hashVal % this.size;
    const bucket = this.buckets[index];

    for (const entry of bucket) {
      if (entry.key === key) {
        entry.value = value;
        return;
      }
    }
    bucket.push({ key, value });
  }

  /**
   * Standard lookup.
   */
  get(key: K): V | undefined {
    const hashVal = this.hash(key);
    const index = hashVal % this.size;
    const bucket = this.buckets[index];

    for (const entry of bucket) {
      if (entry.key === key) {
        return entry.value;
      }
    }
    return undefined;
  }

  /**
   * Standard deletion.
   */
  remove(key: K): void {
    const hashVal = this.hash(key);
    const index = hashVal % this.size;
    const bucket = this.buckets[index];

    const idx = bucket.findIndex(e => e.key === key);
    if (idx !== -1) {
      bucket.splice(idx, 1);
    }
  }

  /**
   * Expose bucket array copies for UI drawing.
   */
  getBucketsState(): any[] {
    return this.buckets.map(b => b.map(entry => ({ ...entry })));
  }

  /**
   * Generator-based Put for visualization.
   */
  *putGenerator(key: K, value: V): Generator<HashMapStep, void, unknown> {
    const hashVal = this.hash(key);
    const index = hashVal % this.size;
    const bucket = this.buckets[index];

    yield {
      buckets: this.getBucketsState(),
      hashValue: hashVal,
      bucketIndex: index,
      variables: { key, value },
      explanation: `Hashed key: "${key}" to integer value ${hashVal}. Computed bucket index = ${hashVal} % ${this.size} = ${index}.`
    };

    let updated = false;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        updated = true;
        yield {
          buckets: this.getBucketsState(),
          hashValue: hashVal,
          bucketIndex: index,
          variables: { key, value, updatedIdx: i },
          explanation: `Found existing key "${key}" at bucket index ${index}, chain element ${i}. Updated value.`
        };
        break;
      }
    }

    if (!updated) {
      bucket.push({ key, value });
      yield {
        buckets: this.getBucketsState(),
        hashValue: hashVal,
        bucketIndex: index,
        variables: { key, value, collision: bucket.length > 1 },
        explanation: bucket.length > 1
          ? `Collision detected at bucket ${index}! Chained entry {${key}: ...} behind existing elements.`
          : `Bucket ${index} was empty. Added entry {${key}: ...} directly.`
      };
    }
  }

  /**
   * Generator-based Get for visualization.
   */
  *getGenerator(key: K): Generator<HashMapStep, V | undefined, unknown> {
    const hashVal = this.hash(key);
    const index = hashVal % this.size;
    const bucket = this.buckets[index];

    yield {
      buckets: this.getBucketsState(),
      hashValue: hashVal,
      bucketIndex: index,
      variables: { key },
      explanation: `Hashed key: "${key}" to ${hashVal}. Target bucket index = ${hashVal} % ${this.size} = ${index}.`
    };

    for (let i = 0; i < bucket.length; i++) {
      yield {
        buckets: this.getBucketsState(),
        hashValue: hashVal,
        bucketIndex: index,
        variables: { key, currentChainIdx: i, currentKey: bucket[i].key },
        explanation: `Checking key in bucket ${index} chain at position ${i}: comparing "${key}" with "${bucket[i].key}".`
      };

      if (bucket[i].key === key) {
        yield {
          buckets: this.getBucketsState(),
          hashValue: hashVal,
          bucketIndex: index,
          variables: { key, value: bucket[i].value },
          explanation: `Match found at position ${i}! Retreived value: ${JSON.stringify(bucket[i].value)}.`
        };
        return bucket[i].value;
      }
    }

    yield {
      buckets: this.getBucketsState(),
      hashValue: hashVal,
      bucketIndex: index,
      variables: { key },
      explanation: `Finished scanning bucket ${index}. Key "${key}" not found in the hash map.`
    };
    return undefined;
  }
}
