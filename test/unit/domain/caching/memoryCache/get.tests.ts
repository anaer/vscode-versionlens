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

  "$i caches $2": [
    [Boolean, true],
    [Boolean, false],
    [String, "string"],
    [Number, 123],
    [Number, 100.123],
    [Object, { item: 123 }],
    [Array, [123, 456]],
    function (this: TestContext, expected: any) {
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