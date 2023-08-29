// import  NpmCliConfig from '@npmcli/config';
import assert from 'assert';
import { CachingOptions, ICachingOptions } from 'domain/caching';
import { ILogger } from 'domain/logging';
import {
  PackageDependency,
  TPackageClientRequest,
  createDependencyRange,
  createPackageResource
} from 'domain/packages';
import { SuggestionStatus, SuggestionTypes, TPackageSuggestion } from 'domain/suggestions';
import {
  GitHubOptions,
  IPacote,
  NpaSpec,
  NpmConfig,
  PacoteClient
} from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';
import npa from 'npm-package-arg';
import { homedir } from 'os';
import { resolve } from 'path';
import { LoggerStub } from 'test/unit/domain/logging';
import { anything, instance, mock, when } from 'ts-mockito';
import { TNpmClientData } from '../../src/definitions/tNpmClientData';
import Fixtures from './pacoteClient.fixtures';
import { PacoteStub } from './stubs/pacoteStub';

let cachingOptsMock: ICachingOptions;
let githubOptsMock: GitHubOptions;
let loggerMock: ILogger;
let configMock: NpmConfig;
let pacoteMock: IPacote;

export const fetchPackageTests = {

  [test.title]: PacoteClient.prototype.fetchPackage.name,

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

    const testClientData: TNpmClientData = {
      projectPath: testPackageRes.path,
      envFilePath: "",
      npmRcFilePath: "",
      userConfigPath: resolve(homedir(), ".npmrc")
    };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryRange)

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'range')
        assert.equal(actual.resolved?.name, testPackageRes.name)
        assert.deepEqual(actual.resolved?.version, testPackageRes.version)
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

    const testClientData: TNpmClientData = {
      projectPath: testPackageRes.path,
      envFilePath: "",
      npmRcFilePath: "",
      userConfigPath: resolve(homedir(), ".npmrc")
    };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryVersion)

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'version')
        assert.equal(actual.resolved?.name, testPackageRes.name)
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

    const testClientData: TNpmClientData = {
      projectPath: testPackageRes.path,
      envFilePath: "",
      npmRcFilePath: "",
      userConfigPath: resolve(homedir(), ".npmrc")
    };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentCappedToLatestTaggedVersion)

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.deepEqual(
          actual.suggestions,
          [
            <TPackageSuggestion>{
              name: SuggestionStatus.Latest,
              version: '',
              type: SuggestionTypes.status
            }
          ]
        )
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

    const testClientData: TNpmClientData = {
      projectPath: testPackageRes.path,
      envFilePath: "",
      npmRcFilePath: "",
      userConfigPath: resolve(homedir(), ".npmrc")
    };

    const testRequest: TPackageClientRequest<any> = {
      providerName: 'testnpmprovider',
      clientData: testClientData,
      dependency: new PackageDependency(
        testPackageRes,
        createDependencyRange(0, 0),
        createDependencyRange(1, 1),
      ),
      attempt: 1
    }

    const npaSpec = npa.resolve(
      testPackageRes.name,
      testPackageRes.version,
      testPackageRes.path
    ) as NpaSpec;

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryAlias)

    const cut = new PacoteClient(
      instance(pacoteMock),
      instance(configMock),
      instance(loggerMock)
    )

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'alias')
        assert.equal(actual.resolved?.name, 'pacote')
        assert.equal(actual.resolved?.version, '11.1.9')
      })
  }

}