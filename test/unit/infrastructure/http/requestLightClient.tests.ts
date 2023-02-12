import assert from 'assert';
import {
  CachingOptions,
  ClientResponseSource,
  HttpClientRequestMethods,
  HttpOptions,
  HttpRequestOptions,
  ICachingOptions,
  IHttpOptions,
  UrlHelpers
} from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { RequestLightClient } from 'infrastructure/http';
import { test } from 'mocha-ui-esm';
import { LoggerStub } from 'test/unit/domain/logging';
import {
  anything,
  capture,
  instance,
  mock,
  when
} from 'ts-mockito';
import { RequestLightStub } from './requestLightStub';

let cachingOptsMock: ICachingOptions;
let httpOptsMock: IHttpOptions;
let loggerMock: ILogger;
let requestLightMock: RequestLightStub;

let rut: RequestLightClient;

export const RequestLightClientTests = {

  [test.title]: "RequestLightHttpClient",

  beforeEach: () => {
    cachingOptsMock = mock(CachingOptions);
    httpOptsMock = mock(HttpOptions);
    loggerMock = mock(LoggerStub);
    requestLightMock = mock(RequestLightStub);

    rut = new RequestLightClient(
      <any>instance(requestLightMock).xhr,
      <HttpRequestOptions>{
        caching: instance(cachingOptsMock),
        http: instance(httpOptsMock)
      },
      instance(loggerMock)
    );

    when(cachingOptsMock.duration).thenReturn(30000);
    when(httpOptsMock.strictSSL).thenReturn(true);
  },

  request: {

    "should set strictSSL to $1 and cache duration to $2 in xhr options": [
      [true, 3000],
      [false, 0],
      async (testStrictSSL: boolean, testDuration: number) => {
        when(requestLightMock.xhr(anything()))
          .thenResolve(<any>{
            responseText: '{}',
            status: 200
          })

        when(cachingOptsMock.duration).thenReturn(testDuration);
        when(httpOptsMock.strictSSL).thenReturn(testStrictSSL);

        const rut = new RequestLightClient(
          <any>instance(requestLightMock).xhr,
          <HttpRequestOptions>{
            caching: instance(cachingOptsMock),
            http: instance(httpOptsMock)
          },
          instance(loggerMock)
        );

        await rut.request(HttpClientRequestMethods.get, 'anywhere')

        const [actualOpts] = capture(requestLightMock.xhr).first();
        assert.equal(actualOpts.strictSSL, testStrictSSL);
      }
    ],

    "generates the expected url $1": [
      ["with no query params", {}],
      ["with query params", { param1: 1, param2: 2 }],
      async (testTitlePart: string, testQuery: KeyStringDictionary) => {
        const testUrl = 'https://test.url.example/path';

        when(requestLightMock.xhr(anything()))
          .thenResolve(<any>{
            status: 200,
            responseText: null
          })

        const expectedUrl = UrlHelpers.createUrl(testUrl, testQuery);

        await rut.request(
          HttpClientRequestMethods.get,
          testUrl,
          testQuery
        )

        const [actualOpts] = capture(requestLightMock.xhr).first();
        assert.equal(actualOpts.url, expectedUrl);
        assert.equal(actualOpts.type, HttpClientRequestMethods.get);
      }
    ],

    "caches url responses on success": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const testResponse = {
        source: ClientResponseSource.remote,
        status: 200,
        responseText: "cached test",
      };

      const expectedCacheData = {
        source: ClientResponseSource.cache,
        status: testResponse.status,
        data: testResponse.responseText,
        rejected: false
      }

      when(requestLightMock.xhr(anything())).thenResolve(<any>testResponse)

      await rut.request(
        HttpClientRequestMethods.get,
        testUrl,
        testQueryParams
      );

      const cachedData = rut.cache.get('GET_' + testUrl);
      assert.deepEqual(cachedData, expectedCacheData);
    },

    "caches url responses when rejected": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const testResponse = {
        status: 404,
        responseText: "not found",
        source: ClientResponseSource.remote
      };

      const expectedCacheData = {
        status: testResponse.status,
        data: testResponse.responseText,
        source: ClientResponseSource.cache,
        rejected: true,
      }

      when(requestLightMock.xhr(anything())).thenReject(<any>testResponse)

      // first request
      try {
        await rut.request(
          HttpClientRequestMethods.get,
          testUrl,
          testQueryParams
        );
        assert.ok(false);
      } catch {
        const cachedData = rut.cache.get('GET_' + testUrl);
        assert.deepEqual(cachedData, expectedCacheData);
      }

      // accessing a cached rejection should also reject
      try {
        await rut.request(
          HttpClientRequestMethods.get,
          testUrl,
          testQueryParams
        );
        assert.ok(false);
      } catch {
        const cachedData = rut.cache.get('GET_' + testUrl);
        assert.deepEqual(cachedData, expectedCacheData);
      }
    },

    "caching disabled when duration is 0": async () => {
      const testUrl = 'https://test.url.example/path';
      const testQueryParams = {}
      const expectedCacheData = undefined;

      when(requestLightMock.xhr(anything()))
        .thenResolve(<any>{
          status: 200,
          responseText: JSON.stringify({ "message": "cached test" })
        });

      when(cachingOptsMock.duration).thenReturn(0);
      when(httpOptsMock.strictSSL).thenReturn(true);

      const response = await rut.request(
        HttpClientRequestMethods.get,
        testUrl,
        testQueryParams
      );
 
      const cachedData = rut.cache.get('GET_' + testUrl);
      assert.equal(cachedData, expectedCacheData);
      assert.equal(response.status, 200);
    },

  },

};