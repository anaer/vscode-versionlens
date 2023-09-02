import assert from "assert";
import {
  PackageCache,
  PackageSourceType,
  PackageVersionType,
  TPackageClientResponse,
  TPackageResource
} from "domain/packages";
import { test } from "mocha-ui-esm";

type TestContext = {
  testProviderName: string;
  testPackageFilePath: string;
  testPackage: TPackageResource;
  testCacheItem: TPackageClientResponse;
  testCache: PackageCache;
}

export const packageCacheTests = {

  [test.title]: PackageCache.name,

  beforeEach: function (this: TestContext) {
    this.testProviderName = "test";
    this.testPackage = {
      name: "test-package",
      version: "1.2.3",
      path: ""
    };
    this.testCacheItem = {
      source: PackageSourceType.Registry,
      type: PackageVersionType.Version,
      suggestions: []
    };
    this.testCache = new PackageCache([this.testProviderName]);
  },

  create: async function (this: TestContext) {
    // test
    const actual = await this.testCache.getOrCreate(
      this.testProviderName,
      this.testPackage,
      async () => this.testCacheItem,
      1000
    )
    // assert
    assert.equal(actual, this.testCacheItem);
  },

  get: async function (this: TestContext) {
    // setup
    await this.testCache.getOrCreate(
      this.testProviderName,
      this.testPackage,
      async () => this.testCacheItem,
      1000
    );

    // test
    const actual = await this.testCache.getOrCreate(
      this.testProviderName,
      this.testPackage,
      async () => undefined,
      1000
    );

    // assert
    assert.equal(actual, this.testCacheItem);
  },

  clear: async function (this: TestContext) {
    // setup
    await this.testCache.getOrCreate(
      this.testProviderName,
      this.testPackage,
      async () => this.testCacheItem,
      1000
    );

    // test
    this.testCache.clear();

    // assert
    const actual = await this.testCache.getOrCreate(
      this.testProviderName,
      this.testPackage,
      async () => undefined,
      1000
    );

    assert.equal(actual, undefined);
  },

}