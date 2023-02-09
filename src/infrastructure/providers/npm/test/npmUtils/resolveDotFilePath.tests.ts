import assert from 'assert';
import { fileExists } from 'domain/utils';
import { NpmUtils } from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';
import path from 'node:path';
import { createDir, createFile, fileDir, removeDir, removeFile } from 'test/unit/utils';

const testDir = fileDir();

const testPathParts = [
  testDir,
  "temp",
  "test-package"
];

const testPackagePath = path.resolve(...testPathParts)
const testProjectPath = path.resolve(...testPathParts.slice(0, 2))

export const resolveDotFilePathTests = {

  [test.title]: NpmUtils.resolveDotFilePath.name,

  beforeAll: async function () {
    this.testPath = await createDir(...testPathParts);
    assert.ok(await fileExists(this.testPath))
  },

  afterAll: async function () {
    await removeDir(...testPathParts);
    assert.equal(await fileExists(this.testPath), false)
  },

  "returns the package path when .npmrc is in same directory": async function () {
    const testFile = path.join(testPackagePath, '.npmrc');

    await createFile(testFile, "test");

    const actual = await NpmUtils.resolveDotFilePath(
      ".npmrc",
      [
        testPackagePath,
        testProjectPath
      ]
    )

    assert.equal(actual, testFile)
    await removeFile(testFile);
  },

  "returns the project path when .npmrc is not in the package path": async function () {
    const testFile = path.join(testProjectPath, '.npmrc');

    await createFile(testFile, "test");

    const actual = await NpmUtils.resolveDotFilePath(
      ".npmrc",
      [
        testPackagePath,
        testProjectPath
      ]
    )

    assert.equal(actual, testFile)
    await removeFile(testFile);
  },

  "returns empty string when .npmrc does not exist": async function () {
    const actual = await NpmUtils.resolveDotFilePath(
      ".npmrc",
      [
        testPackagePath,
        testProjectPath
      ]
    )

    assert.equal(actual, '')
  },

}