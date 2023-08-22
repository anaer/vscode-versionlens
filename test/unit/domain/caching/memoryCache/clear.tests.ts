import assert from 'assert';
import { ICache, MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: ICache
};

export const clearTests = {

  [test.title]: MemoryCache.prototype.clear.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryCache("clearTests");
  },

  clearsAllCachedValues: function (this: TestContext) {
    for (let i = 0; i < 10; i++) {
      this.testCache.set(`key${i}`, i);
    }

    this.testCache.clear();

    for (let i = 0; i < 10; i++) {
      const actual = this.testCache.get<string>(`key${i}`);
      assert.equal(actual, undefined);
    }
  }

};