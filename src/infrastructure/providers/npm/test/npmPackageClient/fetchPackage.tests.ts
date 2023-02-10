import assert from 'assert';
import { ClientResponseSource } from 'domain/clients';
import { PackageDependency, TPackageClientRequest } from 'domain/packages';
import { createPackageResource } from 'domain/packages/utils/packageUtils';
import { SuggestionFlags } from 'domain/suggestions';
import {
  GitHubClient,
  NpmConfig,
  NpmPackageClient,
  PacoteClient
} from 'infrastructure/providers/npm';
import { LoggerStub } from 'test/unit/domain/logging';
import { anything, instance, mock, when } from 'ts-mockito';

let configMock: NpmConfig;
let pacoteMock: PacoteClient;
let githubClientMock: GitHubClient;
let loggerMock: LoggerStub;

export const fetchPackageTests = {

  title: NpmPackageClient.prototype.fetchPackage.name,

  beforeEach: () => {
    configMock = mock(NpmConfig);
    pacoteMock = mock(PacoteClient);
    githubClientMock = mock(GitHubClient);
    loggerMock = mock(LoggerStub);
  },

  'returns a file:// directory package': async () => {
    const expectedSource = 'directory';

    const testPackageRes = createPackageResource(
      // package name
      'filepackage',
      // package version
      'file://some/path/out/there',
      // package path
      'filepackagepath',
    );

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: {},
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    };

    const cut = new NpmPackageClient(
      instance(configMock),
      instance(pacoteMock),
      instance(githubClientMock),
      instance(loggerMock)
    );

    return cut.fetchPackage(testRequest)
      .then(actual => {
        assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
        assert.deepEqual(actual.resolved.name, testPackageRes.name)
      })
  },

  'returns fixed package for git:// requests': async () => {

    const testPackageRes = createPackageResource(
      // package name
      'core.js',
      // package version
      'git+https://git@github.com/testuser/test.git',
      // package path
      'packagepath',
    );

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: {},
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    };

    when(pacoteMock.fetchPackage(anything(), anything()))
      .thenResolve(<any>{
        status: 200,
        data: '',
        source: ClientResponseSource.remote
      })

    // setup initial call
    const cut = new NpmPackageClient(
      instance(configMock),
      instance(pacoteMock),
      instance(githubClientMock),
      instance(loggerMock)
    );

    return cut.fetchPackage(testRequest)
      .then((actual) => {
        assert.equal(actual.source, 'git')
        assert.equal(actual.resolved, null)

        assert.deepEqual(
          actual.suggestions,
          [
            {
              name: 'fixed',
              version: 'git repository',
              flags: SuggestionFlags.status
            }
          ]
        )

      })

  },

  'returns unsupported suggestion when not github': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'core.js',
      // package version
      'git+https://git@not-gihub.com/testuser/test.git',
      // package path
      'packagepath',
    );

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: {},
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    };

    // setup initial call
    const cut = new NpmPackageClient(
      instance(configMock),
      instance(pacoteMock),
      instance(githubClientMock),
      instance(loggerMock)
    );

    return cut.fetchPackage(testRequest)
      .then((actual) => {
        assert.deepEqual(
          actual.suggestions,
          [
            {
              name: 'not supported',
              version: '',
              flags: SuggestionFlags.status
            }
          ]
        )
      })

  },

  'returns 401, 404 and ECONNREFUSED suggestion statuses': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'private-reg',
      // package version
      '1.2.3',
      // package path
      'packagepath',
    );

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: {},
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    };

    const testStates = [
      { status: 401, suggestion: { name: '401 not authorized' } },
      { status: 404, suggestion: { name: 'package not found' } },
      { status: 'ECONNREFUSED', suggestion: { name: 'connection refused' } },
    ]

    // setup initial call
    const cut = new NpmPackageClient(
      instance(configMock),
      instance(pacoteMock),
      instance(githubClientMock),
      instance(loggerMock)
    );

    const promised = []

    testStates.forEach(testState => {

      when(pacoteMock.fetchPackage(anything(), anything()))
        .thenReject(<any>{
          status: testState.status,
          data: "response",
          source: ClientResponseSource.remote
        })

      promised.push(
        cut.fetchPackage(testRequest)
          .then((actual) => {
            assert.equal(actual.source, 'registry')
            assert.equal(actual.resolved, null)
            assert.deepEqual(
              actual.suggestions,
              [{
                name: testState.suggestion.name,
                version: '',
                flags: SuggestionFlags.status
              }]
            )
          })
      )
    })

    return await Promise.all(promised)
  }

}