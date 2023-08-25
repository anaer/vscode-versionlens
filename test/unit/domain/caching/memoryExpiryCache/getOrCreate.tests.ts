import assert from 'assert';
import { IExpiryCache, MemoryExpiryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: IExpiryCache
};

export const getOrCreateTests = {

  [test.title]: MemoryExpiryCache.prototype.getOrCreate.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryExpiryCache("getOrCreateTests");
  },

  "creates entries using function when key doesn't exist": async function (this: TestContext): Promise<void> {
    // setup
    const testKey = "key1";
    const expected = 123;

    // test
    const actual = await this.testCache.getOrCreate(testKey, async () => expected, 6000);

    // assert
    assert.equal(expected, actual);
    assert.equal(expected, this.testCache.get(testKey));
  },

  "catches errors from function when key doesn't exist": async function (this: TestContext): Promise<void> {
    // setup
    const testKey = "key1";
    const testduration = 6000;
    const expectedError = new Error("expected");

    try {
      // test
      await this.testCache.getOrCreate(
        testKey,
        async () => { throw expectedError },
        testduration
      );
      assert.ok(false);
    }
    catch (actual) {
      // assert
      assert.deepEqual(actual, expectedError);
    }

  },

  "returns cached value when key exists": async function (this: TestContext): Promise<void> {
    // setup
    const testKey = "key1";
    const testduration = 6000;
    const notExpected = 999999;
    const expected = 123;

    this.testCache.set(testKey, expected, testduration);

    // test
    const actual = await this.testCache.getOrCreate(testKey, async () => notExpected, testduration);

    // assert
    assert.equal(expected, actual);
    assert.equal(expected, this.testCache.get(testKey));
  }

};