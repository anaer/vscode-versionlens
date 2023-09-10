import assert from 'assert';
import { ICache, MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: ICache
};

export const getTests = {

  [test.title]: MemoryCache.prototype.get.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryCache("getTests");
  },

  "$i caches $1 $2": [
    [Boolean.name, true],
    [Boolean.name, false],
    [String.name, "test text"],
    [Number.name, 123],
    [Number.name, 100.123],
    [Object.name, { item: 123 }],
    [Array.name, [123, 456]],
    function (this: TestContext, titleType: any, expected: any) {
      const testKey = "key1";

      // store the data
      this.testCache.set(testKey, expected);

      // test
      const actual = this.testCache.get(testKey);

      // assert
      assert.deepEqual(expected, actual);
      assert.equal(typeof expected, typeof actual);
    }
  ],

  "returns undefined for non existing keys": function (this: TestContext) {
    const testKey = "key1";

    // test
    const actual = this.testCache.get(testKey);

    // assert
    assert.equal(undefined, actual);
  }

};