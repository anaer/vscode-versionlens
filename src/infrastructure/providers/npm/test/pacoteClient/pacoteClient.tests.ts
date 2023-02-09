import NpmCliConfig from '@npmcli/config';
import assert from 'assert';
import { CachingOptions, ICachingOptions } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageDependency,
  TPackageClientRequest
} from 'domain/packages';
import { SuggestionFlags } from 'domain/suggestions';
import { fileExists } from 'domain/utils';
import {
  GitHubOptions,
  IPacote,
  NpmConfig,
  PacoteClient
} from 'infrastructure/providers/npm';
import path from 'node:path';
import npa from 'npm-package-arg';
import { LoggerStub } from 'test/unit/domain/logging';
import { createFile, fileDir, removeFile } from 'test/unit/utils';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import { TNpmClientData } from '../../src/definitions/tNpmClientData';
import Fixtures from './pacoteClient.fixtures';
import { NpmCliConfigStub } from './stubs/npmCliConfigStub';
import { PacoteStub } from './stubs/pacoteStub';

const testDir = fileDir();

let cachingOptsMock: ICachingOptions;
let githubOptsMock: GitHubOptions;
let loggerMock: ILogger;
let configMock: NpmConfig;
let pacoteMock: IPacote;

export const fetchPackageTests = {

  title: PacoteClient.prototype.fetchPackage.name,

  beforeEach: () => {
    githubOptsMock = mock(GitHubOptions);
    cachingOptsMock = mock(CachingOptions)
    configMock = mock(NpmConfig)
    loggerMock = mock(LoggerStub)
    pacoteMock = mock(PacoteStub)

    when(configMock.caching).thenReturn(instance(cachingOptsMock))
    when(configMock.github).thenReturn(instance(githubOptsMock))
    when(configMock.prereleaseTagFilter).thenReturn([])
  },

  'returns a registry range package': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'pacote',
      // package version
      '10.1.*',
      // package path
      'packagepath',
    );

    const testClientData: TNpmClientData = { projectPath: testPackageRes.path };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryRange)

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'range')
        assert.equal(actual.resolved.name, testPackageRes.name)
        assert.deepEqual(actual.resolved.version, testPackageRes.version)
      })
  },

  'returns a registry version package': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'npm-package-arg',
      // package version
      '8.0.1',
      // package path
      'packagepath',
    );

    const testClientData: TNpmClientData = { projectPath: testPackageRes.path };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryVersion)

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'version')
        assert.equal(actual.resolved.name, testPackageRes.name)
      })
  },

  'returns capped latest versions': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'npm-package-arg',
      // package version
      '7.0.0',
      // package path
      'packagepath',
    );

    const testClientData: TNpmClientData = { projectPath: testPackageRes.path };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentCappedToLatestTaggedVersion)

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.deepEqual(actual.suggestions, [{
          name: 'latest',
          version: '',
          flags: SuggestionFlags.status
        }])
      })
  },

  'returns a registry alias package': async () => {
    const testPackageRes = createPackageResource(
      // package name
      'aliased',
      // package version
      'npm:pacote@11.1.9',
      // package path
      'packagepath',
    );

    const testClientData: TNpmClientData = { projectPath: testPackageRes.path };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryAlias)

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfigStub,
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'alias')
        assert.equal(actual.resolved.name, 'pacote')
        assert.equal(actual.resolved.version, '11.1.9')
      })
  },

  'uses npmrc registry with dotenv file': async function () {
    const packagePath = path.join(
      testDir,
      'npmrc-test'
    );

    const testPackageRes = createPackageResource(
      // package name
      'pacote',
      // package version
      '11.1.9',
      packagePath,
    );

    const testClientData: TNpmClientData = { projectPath: packagePath };

    const testRequest: TPackageClientRequest<TNpmClientData> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        null,
        null,
      ),
      attempt: 1
    }

    // write the npmrc file
    const npmrcPath = packagePath + '/.npmrc';
    const envPath = packagePath + '/.env';

    await createFile(npmrcPath, Fixtures[".npmrc"])
    await createFile(envPath, Fixtures[".npmrc-env"])

    assert.ok(await fileExists(npmrcPath), 'test .npmrc doesnt exist?')
    assert.ok(await fileExists(envPath), 'test .env doesnt exist?')

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentGit)

    const cut = new PacoteClient(
      instance(pacoteMock),
      NpmCliConfig,
      instance(configMock),
      instance(loggerMock)
    )

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    )

    await cut.fetchPackage(testRequest, npaSpec)

    const expectedRegistryAuth = "//registry.npmjs.example/:_authToken";

    const [, actualOpts] = capture(pacoteMock.packument).first()
    assert.equal(actualOpts.cwd, testPackageRes.path);

    const expectedPassword = "12345678";
    assert.equal(actualOpts[expectedRegistryAuth], expectedPassword);

    // delete the temp files
    await removeFile(npmrcPath);
    await removeFile(envPath);
  }

}