import assert from "assert";
import { MemoryExpiryCache } from "domain/caching/memoryExpiryCache";
import { test } from "mocha-ui-esm";

let testCacheMap: MemoryExpiryCache;

export const setTests = {

  [test.title]: MemoryExpiryCache.prototype.set.name,

  beforeEach: () => {
    testCacheMap = new MemoryExpiryCache("testMemoryExpiryCache")
  },

  "stores the data by the key": () => {
    // setup
    const testKey = 'key1';
    const testData = {};
    testCacheMap.set(testKey, testData, 1000);

    // test
    const actual = testCacheMap.get(testKey);

    // assert
    assert.equal(actual, testData);
  },

  "returns the data that was set": () => {
    // setup
    const testKey = 'key1';
    const testData = {};

    // test
    const actual = testCacheMap.set(testKey, testData, 1000);

    // assert
    assert.equal(actual, testData);
  }

}