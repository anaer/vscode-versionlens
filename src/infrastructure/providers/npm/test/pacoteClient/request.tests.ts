import assert from 'assert';
import { CachingOptions, ClientResponseSource, ICachingOptions } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
} from 'domain/packages';
import {
  GitHubOptions,
  IPacote,
  NpmConfig,
  PacoteClient
} from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';
import { LoggerStub } from 'test/unit/domain/logging';
import { anything, instance, mock, when } from 'ts-mockito';
import { NpmCliConfigStub } from './stubs/npmCliConfigStub';
import { PacoteStub } from './stubs/pacoteStub';

let cachingOptsMock: ICachingOptions;
let githubOptsMock: GitHubOptions;
let loggerMock: ILogger;
let configMock: NpmConfig;
let pacoteMock: IPacote;

export const RequestsTests = {

  [test.title]: PacoteClient.prototype.request.name,

  beforeEach: () => {
    githubOptsMock = mock(GitHubOptions);
    cachingOptsMock = mock(CachingOptions)
    configMock = mock(NpmConfig)
    loggerMock = mock(LoggerStub)
    pacoteMock = mock(PacoteStub)

    when(cachingOptsMock.duration).thenReturn(30000);
    when(configMock.caching).thenReturn(instance(cachingOptsMock))
    when(configMock.github).thenReturn(instance(githubOptsMock))
    when(configMock.prereleaseTagFilter).thenReturn([])
  },

  "caches request responses on success": async () => {
    const testResponse = {
      any: "test success response from pacote"
    };

    const expectedCacheData = {
      source: ClientResponseSource.cache,
      status: 200,
      data: testResponse,
      rejected: false
    };

    const testPackageRes = createPackageResource(
      // package name
      'pacote',
      // package version
      '10.1.*',
      // package path
      'packagepath',
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(testResponse);

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    );

    const testCacheKey = cut.getCacheKey(testPackageRes);

    await cut.request(testPackageRes, anything(), anything());

    const cachedData = cut.cache.get(testCacheKey);
    assert.deepEqual(cachedData, expectedCacheData);
  },

  "caches url responses when rejected": async () => {
    const testResponse = {
      code: "E404",
      message: "404 Not Found - GET https://registry.npmjs.org/somepackage - Not found",
    };

    const expectedCacheData = {
      status: testResponse.code,
      data: testResponse.message,
      source: ClientResponseSource.cache,
      rejected: true,
    };

    const testPackageRes = createPackageResource(
      // package name
      'pacote',
      // package version
      '10.1.*',
      // package path
      'packagepath',
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenReject(<any>testResponse);

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    );

    const testCacheKey = cut.getCacheKey(testPackageRes);

    // first request
    try {
      await cut.request(testPackageRes, anything(), anything());
      assert.ok(false);
    } catch {
      const cachedData = cut.cache.get(testCacheKey);
      assert.deepEqual(cachedData, expectedCacheData);
    }

    // accessing a cached rejection should also reject
    try {
      await cut.request(testPackageRes, anything(), anything());
      assert.ok(false);
    } catch {
      const cachedData = cut.cache.get(testCacheKey);
      assert.deepEqual(cachedData, expectedCacheData);
    }
  },

  "caching disabled when duration is 0": async () => {
    const expectedCacheData = undefined;

    const testResponse = {
      any: "test success response from pacote"
    };

    const expectedResponse = {
      status: 200,
      data: testResponse,
      source: ClientResponseSource.remote,
      rejected: false,
    };

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(testResponse);

    when(cachingOptsMock.duration).thenReturn(0);

    const testPackageRes = createPackageResource(
      // package name
      'pacote',
      // package version
      '10.1.*',
      // package path
      'packagepath',
    );

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    );

    const response = await cut.request(testPackageRes, anything(), anything());

    const testCacheKey = cut.getCacheKey(testPackageRes);
    const cachedData = cut.cache.get(testCacheKey);
    assert.equal(cachedData, expectedCacheData);
    assert.deepEqual(response, expectedResponse);
  },
}