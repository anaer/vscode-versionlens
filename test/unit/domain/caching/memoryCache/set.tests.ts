import { nullMessage, undefinedMessage } from '@esm-test/guards';
import assert from 'assert';
import { ICache, MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

type TestContext = {
  testCache: ICache
};

export const setTests = {

  [test.title]: MemoryCache.prototype.set.name,

  beforeEach: function (this: TestContext) {
    this.testCache = new MemoryCache("setTests");
  },

  '$i throws an error when the key is $1': [
    [undefined,  undefinedMessage("key")],
    [null,  nullMessage("key")],
    function (this: TestContext, testKey: string, expectedMessage: string) {
      try {
        this.testCache.set(testKey, 123)
        assert.ok(false)
      } catch (error) {
        assert.equal(error.message, expectedMessage)
      }
    }
  ],

};