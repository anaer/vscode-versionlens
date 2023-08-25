import assert from 'assert';
import { CachingOptions, ClientResponseSource, ICachingOptions } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { createPackageResource } from 'domain/packages';
import {
  GitHubOptions,
  IPacote,
  NpaSpec,
  NpmConfig,
  PacoteClient
} from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';
import npa from 'npm-package-arg';
import { LoggerStub } from 'test/unit/domain/logging';
import { anything, instance, mock, when } from 'ts-mockito';
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

  "returns successful responses": async () => {
    const testResponse = {
      any: "test success response from pacote"
    };

    const expectedResponse = {
      source: ClientResponseSource.remote,
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

    const testNpaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(testResponse);

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    );

    // test
    const actual = await cut.request(testNpaSpec, anything());

    // assert
    assert.deepEqual(actual, expectedResponse);
  },

  "caches url responses when rejected": async () => {
    const testResponse = {
      code: "E404",
      message: "404 Not Found - GET https://registry.npmjs.org/somepackage - Not found",
    };

    const expectedResponse = {
      status: testResponse.code,
      data: testResponse.message,
      source: ClientResponseSource.remote,
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

    const testNpaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenReject(<any>testResponse);

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    );

    try {
      // test
      await cut.request(testNpaSpec, anything());
      assert.ok(false);
    } catch (actual) {
      // assert
      assert.deepEqual(actual, expectedResponse);
    }

  },

}