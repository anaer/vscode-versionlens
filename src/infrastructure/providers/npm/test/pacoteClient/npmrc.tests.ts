import assert from 'assert';
import fs from 'fs';
import path from 'path';
import npa from 'npm-package-arg';

import { sourcePath } from 'test/unit/utils';
import { LoggerStub } from 'test/unit/domain/logging';

import { ILogger } from 'domain/logging';

import { NpmConfig, IPacote, PacoteClient } from 'infrastructure/providers/npm'

import Fixtures from './pacoteClient.fixtures'
import { PacoteStub } from '../stubs/pacoteStub';
import { CachingOptions, ICachingOptions } from 'domain/clients';

const { mock, instance, when, anything, capture } = require('ts-mockito');

let cachingOptsMock: ICachingOptions;
let loggerMock: ILogger;
let configMock: NpmConfig;
let pacoteMock: IPacote;

export default {

  beforeEach: () => {
    cachingOptsMock = mock(CachingOptions)
    configMock = mock(NpmConfig)
    loggerMock = mock(LoggerStub)
    pacoteMock = mock(PacoteStub)

    when(configMock.caching).thenReturn(instance(cachingOptsMock))
  },

  'fetchPackage': {

    'uses npmrc registry': async () => {
      const packagePath = path.join(
        sourcePath,
        'infrastructure/providers/npm/test/fixtures/config'
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
          assert.equal(actualOpts.cwd, testRequest.package.path)
          assert.equal(process.env.NPM_AUTH, "12345678")
          assert.equal(
            actualOpts['//registry.npmjs.example/:_authToken'],
            '12345678'
          )

          // delete the npmrc file
          fs.unlinkSync(npmrcPath)
        })
    },

  }

}