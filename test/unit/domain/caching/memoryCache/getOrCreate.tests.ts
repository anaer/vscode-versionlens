import assert from 'assert';
import { ICache, MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: ICache
};

export const getOrCreateTests = {

  [test.title]: MemoryCache.prototype.getOrCreate.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryCache("getOrCreateTests");
  },

  "creates entries from user function when key doesn't exist": async function (this: TestContext): Promise<void> {
    // setup
    const testKey = "key1";
    const expected = 123;

    // test
    const actual = await this.testCache.getOrCreate(testKey, async () => expected);

    // assert
    assert.equal(expected, actual);
    assert.equal(expected, this.testCache.get(testKey));
  },

  "returns cached value when key exists": async function (this: TestContext): Promise<void> {
    // setup
    const testKey = "key1";
    const notExpected = 999999;
    const expected = 123;

    this.testCache.set(testKey, expected);

    // test
    const actual = await this.testCache.getOrCreate(testKey, async () => notExpected);

    // assert
    assert.equal(expected, actual);
    assert.equal(expected, this.testCache.get(testKey));
  },

};