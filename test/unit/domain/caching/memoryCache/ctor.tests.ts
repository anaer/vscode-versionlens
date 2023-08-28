import { emptyMessage, notTypeMessage } from '@esm-test/guards';
import assert from 'assert';
import { MemoryCache } from 'domain/caching';
import { test } from 'mocha-ui-esm';

export const ctorTests = {

  [test.title]: "constructor",

  '$i throws an error when the cache name is $1': [
    [undefined, notTypeMessage('cacheName', 'string')],
    [null, notTypeMessage('cacheName', 'string')],
    ['', emptyMessage('cacheName')],
    function (testName: string, expectedMessage: string) {
      try {
        new MemoryCache(testName);
        assert.ok(false)
      } catch (error) {
        assert.equal(error.message, expectedMessage)
      }
    }
  ],

  "stores the cache name": function () {
    // setup
    const expected = "test cache name";
    const testCache = new MemoryCache(expected);

    // test
    const actual = testCache.cacheName;

    // assert
    assert.equal(actual, expected);
  },

  "creates empty map": function () {
    // setup
    const testCache = new MemoryCache("test");

    // test
    const actual = testCache.cacheMap;

    // assert
    assert.notEqual(actual, undefined);
    assert.notEqual(actual, null);
    assert.equal(Object.keys(actual).length, 0);
  }

};