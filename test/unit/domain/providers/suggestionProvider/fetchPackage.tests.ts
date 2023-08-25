import assert from 'assert';
import { IExpiryCache, MemoryExpiryCache } from 'domain/caching';
import { ClientResponseSource } from 'domain/clients/index';
import { ILogger } from 'domain/logging';
import {
  IPackageClient,
  PackageClientSourceType,
  PackageDependency,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageNameVersion,
  TPackageResource,
  createDependencyRange,
  createPackageNameVersion,
  createPackageResource
} from 'domain/packages';
import { IProviderConfig, SuggestionProvider } from 'domain/providers';
import { SuggestionFlags } from 'domain/suggestions';
import { test } from 'mocha-ui-esm';
import { anything as any, instance, mock, verify, when } from 'ts-mockito';

type TestContext = {
  loggerMock: ILogger;
  configMock: IProviderConfig,
  suggestionCache: IExpiryCache,
  testLogger: ILogger;
  testProviderName: string;
  testPackageRes: TPackageResource;
  testPackageNameVersion: TPackageNameVersion;
  testRequest: TPackageClientRequest<any>;
  testConfig: IProviderConfig
}

export const FetchPackageTests = <any>{

  [test.title]: SuggestionProvider.prototype.fetchPackage.name,

  beforeEach: function (this: TestContext) {
    // logger mocking
    this.loggerMock = mock<ILogger>()

    this.suggestionCache = new MemoryExpiryCache("");

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

  "returns successful package suggestions": async function (this: TestContext) {
    // setup response
    const testRespDoc: TPackageClientResponse = {
      type: PackageVersionType.Version,
      source: PackageClientSourceType.Registry,
      responseStatus: {
        status: 202,
        source: ClientResponseSource.local
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

    // setup client
    const clientMock: IPackageClient<any> = mock<IPackageClient<any>>();
    when(clientMock.logger).thenReturn(this.testLogger);
    when(clientMock.config).thenReturn(this.testConfig);
    when(clientMock.fetchPackage(this.testRequest)).thenResolve(testRespDoc);
    const testClient = instance(clientMock);

    const abstractProvider = new SuggestionProvider<IPackageClient<any>, any>(
      testClient,
      this.suggestionCache,
      this.testLogger
    );

    // test
    const actual = await abstractProvider.fetchPackage(this.testRequest);

    // verify
    const expectedPackage = this.testRequest.dependency.package;
    verify(this.loggerMock.silly("Fetching %s", expectedPackage.name)).once();
    verify(clientMock.fetchPackage(this.testRequest)).once();
    verify(
      this.loggerMock.info(
        'Fetched from %s %s@%s (%s ms)',
        'client',
        expectedPackage.name,
        expectedPackage.version,
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
      this.testRequest.dependency.rangeEquals(
        <any>actualPackageResp
      )
    )

    assert.equal(actualPackageResp.order, 0);
    assert.equal(actualPackageResp.requested, expectedPackage);
    assert.equal(actualPackageResp.suggestion, testRespDoc.suggestions[0]);
  },

  "writes error status code to log for packages with handled errors":
    async function (this: TestContext) {
      // response
      const testRespDoc: TPackageClientResponse = {
        type: PackageVersionType.Version,
        source: PackageClientSourceType.Registry,
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

      // test
      const abstractProvider = new SuggestionProvider<IPackageClient<any>, null>(
        testClient,
        this.suggestionCache,
        this.testLogger
      );

      // test
      const actual = await abstractProvider.fetchPackage(this.testRequest);

      // verify
      verify(clientMock.fetchPackage(this.testRequest)).once();
      verify(
        this.loggerMock.error(
          "%s@%s was rejected with the status code %s",
          this.testRequest.dependency.package.name,
          this.testRequest.dependency.package.version,
          testRespDoc.responseStatus?.status
        )
      ).once();

      // assert
      assert.equal(actual.length, 1);
      assert.equal(actual[0].providerName, testClient.config.providerName);
    }

};