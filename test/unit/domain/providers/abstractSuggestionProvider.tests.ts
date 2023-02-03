import assert from 'assert';
import { ClientResponseSource } from 'domain/clients/index';
import { ILogger } from 'domain/logging';
import {
  createDependencyRange,
  createPackageNameVersion,
  createPackageResource,
  IPackageClient,
  PackageDependency,
  PackageSourceType,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { SuggestionFlags } from 'domain/suggestions/index';
import { test } from 'mocha-ui-esm';
import { anything as any, instance, mock, verify, when } from 'ts-mockito';

export const AbstractSuggestionProviderTests = {

  [test.title]: AbstractSuggestionProvider.name,

  fetchPackage: {

    "returns package suggestions": async () => {
      const testProviderName = "test provider";

      const testPackageRes = createPackageResource(
        "testPackageName",
        "1.0.0",
        "test/path"
      );

      const testPackageNameVersion = createPackageNameVersion(
        testPackageRes.name,
        testPackageRes.version
      );

      // logger
      const loggerMock: ILogger = mock<ILogger>()
      const testLogger = instance(loggerMock);

      // response
      const testRespDoc: TPackageClientResponse = {
        type: PackageVersionType.Version,
        source: PackageSourceType.Registry,
        responseStatus: {
          status: 202,
          source: ClientResponseSource.local
        },
        resolved: testPackageNameVersion,
        suggestions: [
          {
            name: testPackageRes.name,
            version: "1.0.0",
            flags: SuggestionFlags.release
          }
        ]
      };

      const testRequest: TPackageClientRequest<any> = {
        providerName: testProviderName,
        attempt: 1,
        clientData: {},
        dependency: new PackageDependency(
          testPackageRes,
          //nameRange
          createDependencyRange(1, 20),
          //versionRange
          createDependencyRange(25, 30)
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

      // @ts-ignore
      // test
      const abstractProvider = new AbstractSuggestionProvider(
        null,
        null
      );

      return abstractProvider.fetchPackage(testClient, testRequest)
        .then(actual => {
          // verify
          verify(loggerMock.debug("Fetching %s", "testPackageName")).once();
          verify(clientMock.fetchPackage(testRequest)).once();
          verify(
            loggerMock.info(
              'Fetched %s@%s from %s (%s ms)',
              testRequest.dependency.package.name,
              testRequest.dependency.package.version,
              testRespDoc.responseStatus.source,
              any()
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

          assert.equal(actual[0].requested, testRequest.dependency.package);
          assert.equal(actual[0].resolved, testRespDoc.resolved);
          assert.equal(actual[0].suggestion, testRespDoc.suggestions[0]);
        });
    },

  }

};