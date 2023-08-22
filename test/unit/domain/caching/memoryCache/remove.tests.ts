import assert from 'assert';
import { ICache, MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: ICache
};

export const removeTests = {

  [test.title]: MemoryCache.prototype.remove.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryCache("getTests");
  },

  "removed existing items": function (this: TestContext) {
    // setup
    const testKey = "key1";

    this.testCache.set(testKey, "alive");

    // test
    this.testCache.remove(testKey);

    // assert
    const actual = this.testCache.get(testKey);

    assert.equal(undefined, actual);
  },

  "handles non-existing items": function (this: TestContext) {
    // setup
    const testKey = "key1";

    // test
    this.testCache.remove(testKey);

    // assert
    const actual = this.testCache.get(testKey);

    assert.equal(undefined, actual);
  }

};