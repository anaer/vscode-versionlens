import assert from 'assert';
import { CachingOptions, ICachingOptions } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { SuggestionFlags } from 'domain/suggestions';
import fs from 'fs';
import {
  GitHubOptions,
  IPacote,
  NpmConfig,
  PacoteClient
} from 'infrastructure/providers/npm';
import npa from 'npm-package-arg';
import path from 'path';
import { LoggerStub } from 'test/unit/domain/logging';
import { sourcePath } from 'test/unit/utils';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import Fixtures from './pacoteClient.fixtures';
import { NpmCliConfigStub } from './stubs/npmCliConfigStub';
import { PacoteStub } from './stubs/pacoteStub';

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
  },

  'returns a registry range package': async () => {

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'pacote',
        version: '10.1.*',
      }
    }

    const npaSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryRange)

    const cut = new PacoteClient(
      instance(configMock),
      instance(loggerMock)
    )

    cut.pacote = instance(pacoteMock)
    cut.NpmCliConfig = NpmCliConfigStub

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'range')
        assert.equal(actual.resolved.name, testRequest.package.name)
        assert.deepEqual(actual.requested, testRequest.package)
      })
  },

  'returns a registry version package': async () => {

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'npm-package-arg',
        version: '8.0.1',
      }
    }

    const npaSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryVersion)

    const cut = new PacoteClient(
      instance(configMock),
      instance(loggerMock)
    )

    cut.pacote = instance(pacoteMock)
    cut.NpmCliConfig = NpmCliConfigStub

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'version')
        assert.equal(actual.resolved.name, testRequest.package.name)
      })
  },

  'returns capped latest versions': async () => {

    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'npm-package-arg',
        version: '7.0.0',
      }
    }

    const npaSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentCappedToLatestTaggedVersion)

    const cut = new PacoteClient(
      instance(configMock),
      instance(loggerMock)
    )

    cut.pacote = instance(pacoteMock)
    cut.NpmCliConfig = NpmCliConfigStub

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
    const testRequest: any = {
      clientData: {
        providerName: 'testnpmprovider',
      },
      package: {
        path: 'packagepath',
        name: 'aliased',
        version: 'npm:pacote@11.1.9',
      }
    }

    const npaSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(pacoteMock.packument(anything(), anything()))
      .thenResolve(Fixtures.packumentRegistryAlias)

    const cut = new PacoteClient(
      instance(configMock),
      instance(loggerMock)
    )

    cut.pacote = instance(pacoteMock)
    cut.NpmCliConfig = NpmCliConfigStub

    return cut.fetchPackage(testRequest, npaSpec)
      .then((actual) => {
        assert.equal(actual.source, 'registry')
        assert.equal(actual.type, 'alias')
        assert.equal(actual.requested.name, testRequest.package.name)
        assert.equal(actual.resolved.name, 'pacote')
        assert.deepEqual(actual.requested, testRequest.package)
      })
  },

  'uses npmrc registry when allowEnvFiles is "$1"': [
    true,
    false,
    async function (testAllowEnvFiles) {
      this.test.title = this.test.title.replace("$1", testAllowEnvFiles);

      const packagePath = path.join(
        sourcePath,
        'infrastructure/providers/npm/test/pacoteClient/npmrc-test'
      );

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        source: 'npmtest',
        package: {
          path: packagePath,
          name: 'aliased',
          version: 'npm:pacote@11.1.9',
        },
      }

      // write the npmrc file
      const npmrcPath = packagePath + '/.npmrc';
      fs.writeFileSync(npmrcPath, Fixtures[".npmrc"])
      fs.writeFileSync(`${packagePath}/.env`, Fixtures[".npmrc-env"])
      assert.ok(fs.existsSync(testRequest.package.path), 'test .npmrc doesnt exist?')

      when(pacoteMock.packument(anything(), anything()))
        .thenResolve(Fixtures.packumentGit)

      // mock allow .env files
      when(configMock.allowEnvFiles).thenReturn(testAllowEnvFiles)

      const cut = new PacoteClient(
        instance(configMock),
        instance(loggerMock)
      )

      cut.pacote = instance(pacoteMock)
      cut.NpmCliConfig = require("@npmcli/config")

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      )

      return cut.fetchPackage(testRequest, npaSpec)
        .then(_ => {

          const [, actualOpts] = capture(pacoteMock.packument).first()
          assert.equal(actualOpts.cwd, testRequest.package.path);

          const expectedPassword = testAllowEnvFiles ? "12345678" : undefined;
          assert.equal(process.env.NPM_AUTH, expectedPassword);

          const expectedAuthToken = testAllowEnvFiles ? expectedPassword : "${NPM_AUTH}";
          assert.equal(
            actualOpts['//registry.npmjs.example/:_authToken'],
            expectedAuthToken
          );

          // delete the npmrc file
          fs.unlinkSync(npmrcPath)
          delete process.env.NPM_AUTH;
        })
    }
  ],

}