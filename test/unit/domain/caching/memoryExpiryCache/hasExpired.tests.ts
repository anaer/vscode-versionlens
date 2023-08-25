import assert from "assert";
import { MemoryExpiryCache } from "domain/caching/memoryExpiryCache";
import { test } from "mocha-ui-esm";
import { delay } from "test/unit/utils";

let testCacheMap: MemoryExpiryCache;

export const hasExpiredTests = {

  [test.title]: MemoryExpiryCache.prototype.hasExpired.name,

  beforeEach: () => {
    testCacheMap = new MemoryExpiryCache("testMemoryExpiryCache")
  },

  "returns true when no key exists": () => {
    // test, assert
    assert.ok(testCacheMap.hasExpired('missing'));
  },

  "returns false when a cache entry is still within the cache duration": () => {
    // setup
    const testKey = 'key1';
    testCacheMap.set(testKey, {}, 3000);

    // test
    const actual = testCacheMap.hasExpired(testKey);

    // assert
    assert.ok(actual === false);
  },

  "returns true when the cache entry is beyond the cache duration": () => {
    // setup
    const testKey = 'key1';
    testCacheMap.set(testKey, {}, -1);

    // test
    const actual = testCacheMap.hasExpired(testKey);

    // assert
    assert.ok(actual);
  },

  "returns true when duration has elapsed": async () => {
    // setup
    const testKey = 'duration';
    const testDuration = 250;
    testCacheMap.set(testKey, "should of expired", testDuration)

    return delay(testDuration + 10)
      .then(() => {
        // test
        const actual = testCacheMap.hasExpired(testKey);

        // assert
        assert.equal(actual, true);
      });
  },

  "returns false when duration has not elapsed": async () => {
    // setup
    const testKey = 'duration';
    const testDuration = 250;
    testCacheMap.set(testKey, "should not be expired", testDuration)

    return delay(testDuration - 100)
      .then(() => {
        // test
        const actual = testCacheMap.hasExpired(testKey);

        // assert
        assert.equal(actual, false);
      });
  },

}