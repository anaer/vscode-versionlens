import { fetchPackage } from 'application/packages';
import assert from 'assert';
import { ClientResponseSource } from 'domain/clients/index';
import { ILogger } from 'domain/logging';
import {
  createDependencyRange,
  createPackageIdentifier,
  createPackageNameVersion,
  IPackageClient,
  PackageDependency,
  PackageSourceTypes,
  PackageVersionTypes,
  TPackageDocument,
  TPackageRequest
} from 'domain/packages';
import { SuggestionFlags } from 'domain/suggestions/index';
import { test } from 'mocha-ui-esm';
import { instance, mock, verify, when } from 'ts-mockito';

export const fetchPackageTests = {

  [test.title]: fetchPackage.name,

  "returns package suggestions": async () => {
    const testProviderName = "test provider";

    const testPackageId = createPackageIdentifier(
      "testPackageName",
      "1.0.0",
      "test/path"
    );

    const testPackageNameVersion = createPackageNameVersion(
      testPackageId.name,
      testPackageId.version
    );

    // logger
    const loggerMock: ILogger = mock<ILogger>()
    const testLogger = instance(loggerMock);

    // response
    const testRespDoc: TPackageDocument = {
      type: PackageVersionTypes.Version,
      source: PackageSourceTypes.Registry,
      response: {
        status: 202,
        source: ClientResponseSource.local
      },
      requested: testPackageId,
      resolved: testPackageNameVersion,
      suggestions: [
        {
          name: testPackageId.name,
          version: "1.0.0",
          flags: SuggestionFlags.release
        }
      ]
    };

    const testRequest: TPackageRequest<any> = {
      providerName: testProviderName,
      attempt: 1,
      clientData: {},
      package: testPackageId,
      dependency: new PackageDependency(
        //nameRange
        createDependencyRange(1, 20),
        //versionRange
        createDependencyRange(25, 30),
        // packageInfo
        testPackageNameVersion
      )
    };

    // client
    const clientMock: IPackageClient<any> = mock<IPackageClient<any>>();
    when(clientMock.logger).thenReturn(testLogger);
    when(clientMock.config).thenReturn(<any>{
      providerName: testProviderName
    })
    when(clientMock.fetchPackage(testRequest)).thenResolve(testRespDoc);
    const testClient = instance(clientMock);

    // test
    return fetchPackage(testClient, testRequest)
      .then(actual => {
        // verify
        verify(loggerMock.debug("Queued package: %s", "testPackageName")).once();
        verify(clientMock.fetchPackage(testRequest)).once();
        verify(
          loggerMock.info(
            'Fetched %s package from %s: %s@%s',
            testClient.config.providerName,
            testRespDoc.response.source,
            testRequest.package.name,
            testRequest.package.version
          )
        ).once();

        // assert
        assert.equal(actual.length, 1);
        assert.equal(actual[0].providerName, testClient.config.providerName);
        assert.equal(actual[0].source, testRespDoc.source);
        assert.equal(actual[0].type, testRespDoc.type);

        assert.equal(actual[0].nameRange, testRequest.dependency.nameRange);
        assert.equal(actual[0].versionRange, testRequest.dependency.versionRange);
        assert.equal(actual[0].order, 0);

        assert.equal(actual[0].requested, testRespDoc.requested);
        assert.equal(actual[0].resolved, testRespDoc.resolved);
        assert.equal(actual[0].suggestion, testRespDoc.suggestions[0]);
      });
  },

};