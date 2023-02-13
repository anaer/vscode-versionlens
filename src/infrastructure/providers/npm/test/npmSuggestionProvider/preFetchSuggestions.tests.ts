import assert from 'assert';
import { ILogger } from 'domain/logging';
import { fileExists } from 'domain/utils';
import {
  GitHubOptions,
  NpmConfig,
  NpmPackageClient,
  NpmSuggestionProvider,
  TNpmClientData
} from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';
import { homedir } from 'node:os';
import path, { resolve } from 'node:path';
import { createDir, createFile, fileDir, removeDir, removeFile } from 'test/unit/utils';
import { instance, mock, verify, when } from 'ts-mockito';

const testDir = fileDir();

const testPathParts = [
  testDir,
  "temp",
  "test-package"
];

const testPackagePath = path.resolve(...testPathParts)
const testProjectPath = path.resolve(...testPathParts.slice(0, 2))

type AllTestContext = {
  testPath: string
}

type TestContext = {
  githubOptsMock: GitHubOptions,
  clientMock: NpmPackageClient,
  configMock: NpmConfig,
  loggerMock: ILogger
}

export const NpmSuggestionProviderTests = {

  [test.title]: NpmSuggestionProvider.name,

  beforeAll: async function (this: AllTestContext) {
    this.testPath = await createDir(...testPathParts);
    assert.ok(await fileExists(this.testPath))
  },

  afterAll: async function (this: AllTestContext) {
    await removeDir(...testPathParts);
    assert.equal(await fileExists(this.testPath), false)
  },

  preFetchSuggestions: {

    beforeEach: async function (this: TestContext) {
      this.githubOptsMock = mock<GitHubOptions>();
      this.clientMock = mock<NpmPackageClient>();
      this.configMock = mock<NpmConfig>();
      this.loggerMock = mock<ILogger>();
      when(this.configMock.github).thenReturn(instance(this.githubOptsMock));
      when(this.clientMock.config).thenReturn(instance(this.configMock));
    },

    "returns client data with .npmrc path": async function (this: TestContext) {
      const testNpmRcFilePath = path.join(testPackagePath, '.npmrc');
      const testEnvFilePath = path.join(testPackagePath, '.env');

      const put = new NpmSuggestionProvider(
        instance(this.clientMock),
        instance(this.loggerMock)
      );

      await createFile(testNpmRcFilePath, "test npmrc");
      await createFile(testEnvFilePath, "test env");

      const expectedClientData: TNpmClientData = {
        projectPath: testProjectPath,
        userConfigPath: resolve(homedir(), ".npmrc"),
        npmRcFilePath: testNpmRcFilePath,
        envFilePath: testEnvFilePath
      }

      const actualClientData = await put.preFetchSuggestions(
        testProjectPath,
        testPackagePath
      );

      verify(this.loggerMock.debug("Resolved .npmrc %s", testNpmRcFilePath)).once();

      assert.deepEqual(actualClientData, expectedClientData);

      // clean up
      await removeFile(testNpmRcFilePath);
      await removeFile(testEnvFilePath);
    },

    "returns client data with empty .npmrc path": async function (this: TestContext) {
      const put = new NpmSuggestionProvider(
        instance(this.clientMock),
        instance(this.loggerMock)
      );

      const expectedClientData: TNpmClientData = {
        projectPath: testProjectPath,
        userConfigPath: resolve(homedir(), ".npmrc"),
        npmRcFilePath: "",
        envFilePath: ""
      }

      const actualClientData = await put.preFetchSuggestions(
        testProjectPath,
        testPackagePath
      );

      assert.deepEqual(actualClientData, expectedClientData);
    },

  }

}