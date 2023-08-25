import assert from "assert";
import { MemoryExpiryCache } from "domain/caching/memoryExpiryCache";
import { test } from "mocha-ui-esm";

let testCacheMap: MemoryExpiryCache;

export const expireTests = {

  [test.title]: MemoryExpiryCache.prototype.expire.name,

  beforeEach: () => {
    testCacheMap = new MemoryExpiryCache("testMemoryExpiryCache")
  },

  "expires items in the cache": () => {
    // setup
    const testKey = 'key1';
    const testData = "initial data";
    testCacheMap.set(testKey, testData, 1000);

    // test
    testCacheMap.expire(testKey);

    // assert
    assert.ok(testCacheMap.hasExpired(testKey));
    assert.equal(testCacheMap.get(testKey), undefined);
  }

}