import assert from 'assert';
import { ClientResponseSource } from 'domain/clients';
import {
  createDependencyRange,
  createPackageResource,
  PackageDependency,
  PackageSourceType,
  TPackageClientRequest
} from 'domain/packages';
import {
  SuggestionCategory,
  SuggestionStatusText,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/suggestions';
import {
  GitHubClient,
  NpmConfig,
  NpmPackageClient,
  PacoteClient
} from 'infrastructure/providers/npm';
import { LoggerStub } from 'test/unit/domain/logging';
import { fileDir } from 'test/unit/utils';
import { anything, instance, mock, when } from 'ts-mockito';

const testDir = fileDir();

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
      'file:../../..',
      // package path
      testDir,
    );

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: {},
      dependency: new PackageDependency(
        testPackageRes,
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
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
        assert.equal(actual.source, PackageSourceType.Directory, `expected to see ${expectedSource}`)
        assert.deepEqual(actual.resolved?.name, testPackageRes.name)
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
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
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
            <TPackageSuggestion>{
              name: SuggestionStatusText.Fixed,
              category: SuggestionCategory.Match,
              version: 'git repository',
              type: SuggestionTypes.status
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
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
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
            <TPackageSuggestion>{
              name: SuggestionStatusText.NotSupported,
              category: SuggestionCategory.NoMatch,
              version: '',
              type: SuggestionTypes.status
            }
          ]
        )
      })

  },

  'returns $1 suggestion statuses': [
    ["401", { status: 401, suggestion: { name: SuggestionStatusText.NotAuthorized} }],
    ["404", { status: 404, suggestion: { name: SuggestionStatusText.NotFound } }],
    ["ECONNREFUSED", { status: 'ECONNREFUSED', suggestion: { name: SuggestionStatusText.ConnectionRefused } }],
    async (testTitlePart: string, testState: any) => {
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
          createDependencyRange(0, 0),
          createDependencyRange(1, 1),
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

      when(pacoteMock.fetchPackage(anything(), anything()))
        .thenReject(<any>{
          status: testState.status,
          data: "response",
          source: ClientResponseSource.remote
        })

      const actual = await cut.fetchPackage(testRequest)

      assert.equal(actual.source, 'registry')
      assert.equal(actual.resolved, null)
      assert.deepEqual(
        actual.suggestions,
        [
          <TPackageSuggestion>{
            name: testState.suggestion.name,
            category: SuggestionCategory.Error,
            version: '',
            type: SuggestionTypes.status
          }
        ]
      )
    }
  ]

}