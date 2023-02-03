import assert from 'assert';
import { ClientResponseSource } from 'domain/clients/index';
import { SuggestionFlags } from 'domain/suggestions/index';
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

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      source: 'npmtest',
      package: {
        path: 'filepackagepath',
        name: 'filepackage',
        version: 'file://some/path/out/there',
      }
    }

    const cut = new NpmPackageClient(
      instance(configMock),
      instance(pacoteMock),
      instance(githubClientMock),
      instance(loggerMock)
    );

    return cut.fetchPackage(testRequest)
      .then(actual => {
        assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
        assert.deepEqual(actual.resolved.name, testRequest.package.name)
      })
  },

  'returns fixed package for git:// requests': async () => {

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'git+https://git@github.com/testuser/test.git',
      }
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

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'git+https://git@not-gihub.com/testuser/test.git',
      }
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
    const testRequest: any = {
      providerName: 'testnpmprovider',
      package: {
        path: 'packagepath',
        name: 'private-reg',
        version: '1.2.3',
      }
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