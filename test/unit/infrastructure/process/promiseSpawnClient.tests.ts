import assert from 'assert';
import {
  CachingOptions,
  ClientResponseSource,
  ICachingOptions,
  ProcessClientResponse
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PromiseSpawnClient } from 'infrastructure/process';
import { test } from 'mocha-ui-esm';
import { LoggerStub } from 'test/unit/domain/logging';
import { anything, instance, mock, when } from 'ts-mockito';
import { ProcessSpawnStub } from './processSpawnStub';

let psMock: ProcessSpawnStub;
let cachingMock: ICachingOptions;
let loggerMock: ILogger;

export const ProcessClientRequestTests = {

  [test.title]: PromiseSpawnClient.name,

  beforeEach: () => {
    cachingMock = mock(CachingOptions)
    loggerMock = mock(LoggerStub)
    psMock = mock(ProcessSpawnStub)
  },

  request: {

    "returns <ProcessClientResponse> when error occurs": async () => {

      when(cachingMock.duration).thenReturn(30000);

      when(psMock.promiseSpawn(anything(), anything(), anything()))
        .thenReject(<any>{
          code: "ENOENT",
          message: "spawn missing ENOENT"
        });

      const rut = new PromiseSpawnClient(
        instance(psMock).promiseSpawn,
        instance(cachingMock),
        instance(loggerMock)
      );

      try {
        await rut.request(
          'missing',
          ['--ooppss'],
          '/'
        );
      }
      catch (error) {
        const response = error as ProcessClientResponse;
        assert.equal(response.status, "ENOENT");
        assert.equal(response.data, "spawn missing ENOENT");
        assert.equal(response.rejected, true);
      }

    },

    "returns <ProcessClientResponse> and caches response": async () => {
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
        rejected: false
      }

      const expectedCacheData = {
        source: ClientResponseSource.cache,
        status: testResponse.status,
        data: testResponse.data,
        rejected: false
      };

      when(psMock.promiseSpawn(anything(), anything(), anything()))
        .thenResolve(<any>{
          code: 0,
          stdout: testResponse.data
        });

      when(cachingMock.duration).thenReturn(30000);

      const rut = new PromiseSpawnClient(
        instance(psMock).promiseSpawn,
        instance(cachingMock),
        instance(loggerMock)
      );

      const firstResponse = await rut.request(
        'echo',
        ['123'],
        'd:\\'
      );

      assert.deepEqual(firstResponse, testResponse);

      const cachedResponse = await rut.request(
        'echo',
        ['123'],
        'd:\\'
      );

      assert.deepEqual(cachedResponse, expectedCacheData);
    },

    "doesn't cache when duration is 0": async () => {
      const testKey = 'echo 123';
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
        rejected: false,
      }

      when(psMock.promiseSpawn(anything(), anything(), anything()))
        .thenResolve(<any>{
          code: 0,
          stdout: testResponse.data
        });

      when(cachingMock.duration).thenReturn(0);

      const rut = new PromiseSpawnClient(
        instance(psMock).promiseSpawn,
        instance(cachingMock),
        instance(loggerMock)
      );

      const firstResponse = await rut.request(
        'echo',
        ['123'],
        'd:\\'
      );

      assert.deepEqual(firstResponse, testResponse);

      const cachedResponse = await rut.request(
        'echo',
        ['123'],
        'd:\\'
      );

      assert.deepEqual(cachedResponse, testResponse);
      const cachedData = rut.cache.get(testKey);
      assert.equal(cachedData, undefined);
    },

  },

};