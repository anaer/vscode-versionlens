import assert from 'assert';
import { ClientResponseSource } from 'domain/clients/index';
import { ILogger } from 'domain/logging';
import {
  createDependencyRange,
  createPackageNameVersion,
  createPackageResource,
  IPackageClient,
  PackageDependency,
  PackageResponse,
  PackageSourceType,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageNameVersion,
  TPackageResource
} from 'domain/packages';
import { AbstractSuggestionProvider, IProviderConfig } from 'domain/providers';
import { SuggestionFlags } from 'domain/suggestions';
import { test } from 'mocha-ui-esm';
import { anything as any, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  loggerMock: ILogger;
  testLogger: ILogger;
  testProviderName: string;
  testPackageRes: TPackageResource;
  testPackageNameVersion: TPackageNameVersion;
  testRequest: TPackageClientRequest<any>;
  configMock: IProviderConfig,
  testConfig: IProviderConfig
}

export const AbstractSuggestionProviderTests = {

  [test.title]: AbstractSuggestionProvider.name,

  fetchPackage: {

    beforeEach: function () {
      // logger mocking
      this.loggerMock = mock<ILogger>()

      // typical test params
      this.testLogger = instance(this.loggerMock) as ILogger;

      this.testProviderName = "test provider";

      this.testPackageRes = createPackageResource(
        "testPackageName",
        "1.0.0",
        "test/path"
      );

      this.testPackageNameVersion = createPackageNameVersion(
        this.testPackageRes.name,
        this.testPackageRes.version
      );

      this.testRequest = {
        providerName: this.testProviderName,
        attempt: 1,
        clientData: {},
        dependency: new PackageDependency(
          this.testPackageRes,
          //nameRange
          createDependencyRange(1, 20),
          //versionRange
          createDependencyRange(25, 30)
        )
      } as TPackageClientRequest<any>

      // config
      const configMock: IProviderConfig = mock<IProviderConfig>();
      when(configMock.providerName).thenReturn(this.testProviderName);
      this.testConfig = instance(configMock);
    },

    "returns successful package suggestions": async function () {
      const testContext = this as TestContext;

      // response
      const testRespDoc: TPackageClientResponse = {
        type: PackageVersionType.Version,
        source: PackageSourceType.Registry,
        responseStatus: {
          status: 202,
          source: ClientResponseSource.local
        },
        resolved: testContext.testPackageNameVersion,
        suggestions: [
          {
            name: testContext.testPackageRes.name,
            version: "1.0.0",
            flags: SuggestionFlags.release
          }
        ]
      };

      // client
      const clientMock: IPackageClient<any> = mock<IPackageClient<any>>();
      when(clientMock.logger).thenReturn(testContext.testLogger);
      when(clientMock.config).thenReturn(testContext.testConfig);
      when(clientMock.fetchPackage(testContext.testRequest)).thenResolve(testRespDoc);
      const testClient = instance(clientMock);

      // @ts-ignore
      // test
      const abstractProvider = new AbstractSuggestionProvider(
        testContext.testConfig,
        testClient,
        null
      ) as AbstractSuggestionProvider<IProviderConfig, IPackageClient<any>, any>;

      return abstractProvider.fetchPackage(testContext.testRequest)
        .then((actual: Array<PackageResponse>) => {
          // verify
          verify(testContext.loggerMock.debug("Fetching %s", "testPackageName")).once();
          verify(clientMock.fetchPackage(testContext.testRequest)).once();
          verify(
            testContext.loggerMock.info(
              'Fetched %s@%s from %s (%s ms)',
              testContext.testRequest.dependency.package.name,
              testContext.testRequest.dependency.package.version,
              testRespDoc.responseStatus.source,
              any()
            )
          ).once();

          // assert
          assert.equal(actual.length, 1);
          const actualPackageResp = actual[0];

          assert.equal(
            actualPackageResp.providerName,
            testClient.config.providerName
          );

          assert.equal(actualPackageResp.source, testRespDoc.source);
          assert.equal(actualPackageResp.type, testRespDoc.type);

          // test name, version and their range are the same
          assert.equal(actualPackageResp.resolved, testRespDoc.resolved);
          assert.ok(
            testContext.testRequest.dependency.rangeEquals(
              <any>actualPackageResp
            )
          )

          assert.equal(actualPackageResp.order, 0);

          assert.equal(
            actualPackageResp.requested,
            testContext.testRequest.dependency.package
          );

          assert.equal(actualPackageResp.suggestion, testRespDoc.suggestions[0]);
        });
    },

    "writes error status code to log for packages with handled errors": async function () {
      // response
      const testRespDoc: TPackageClientResponse = {
        type: PackageVersionType.Version,
        source: PackageSourceType.Registry,
        responseStatus: {
          status: 401,
          source: ClientResponseSource.local,
          rejected: true
        },
        resolved: this.testPackageNameVersion,
        suggestions: [
          {
            name: this.testPackageRes.name,
            version: "1.0.0",
            flags: SuggestionFlags.release
          }
        ]
      };

      // client
      const clientMock: IPackageClient<any> = mock<IPackageClient<any>>();
      when(clientMock.logger).thenReturn(this.testLogger);
      when(clientMock.config).thenReturn(this.testConfig)
      when(clientMock.fetchPackage(this.testRequest)).thenResolve(testRespDoc);
      const testClient = instance(clientMock);

      // @ts-ignore
      // test
      const abstractProvider = new AbstractSuggestionProvider(
        null,
        testClient,
        null
      ) as AbstractSuggestionProvider<IProviderConfig, IPackageClient<any>, null>;

      return abstractProvider.fetchPackage(this.testRequest)
        .then(actual => {
          // verify
          // verify(this.loggerMock.debug("Fetching %s", "testPackageName")).once();
          verify(clientMock.fetchPackage(this.testRequest)).once();
          verify(
            this.loggerMock.error(
              "%s@%s was rejected with the status code %s",
              this.testRequest.dependency.package.name,
              this.testRequest.dependency.package.version,
              testRespDoc.responseStatus.status
            )
          ).once();

          // assert
          assert.equal(actual.length, 1);
          assert.equal(actual[0].providerName, testClient.config.providerName);
        });
    },

  }

};