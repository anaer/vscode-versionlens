import assert from "assert";
import { MemoryExpiryCache } from "domain/caching/memoryExpiryCache";
import { test } from "mocha-ui-esm";

let testCacheMap: MemoryExpiryCache;

export const getTests = {

  [test.title]: MemoryExpiryCache.prototype.get.name,

  beforeEach: () => {
    testCacheMap = new MemoryExpiryCache("testMemoryExpiryCache")
  },

  "returns undefined if the key does not exist": () => {
    // setup
    const testKey = 'missing';

    // test
    const actual = testCacheMap.get(testKey);

    // assert
    assert.equal(actual, undefined);
  },

  "returns entry when unexpired": () => {
    // setup
    const testKey = 'key1';
    const testData = {};
    testCacheMap.set(testKey, testData, 1000);

    // test
    const actual = testCacheMap.get(testKey);

    // assert
    assert.equal(actual, testData);
  },

  "returns undefined when expired": () => {
    // setup
    const testKey = 'key1';
    const testData = {};
    testCacheMap.set(testKey, testData, -1);

    // test
    const actual = testCacheMap.get(testKey);

    // assert
    assert.equal(actual, undefined);
  }

}