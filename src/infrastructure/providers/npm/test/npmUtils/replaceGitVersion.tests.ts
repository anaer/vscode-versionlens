import assert from 'assert';
import {
  createDependencyRange,
  PackageClientSourceType,
  PackageResponse
} from 'domain/packages';
import { NpmUtils } from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';

export const npmReplaceVersionTests = {

  [test.title]: NpmUtils.npmReplaceVersion.name,

  "handles #tag|commit|semver:": () => {
    const packageInfo: PackageResponse = {
      providerName: 'testreplace',
      source: PackageClientSourceType.Github,
      nameRange: createDependencyRange(0, 0),
      versionRange: createDependencyRange(1, 1),
      order: 0,
      requested: {
        path: 'packagepath',
        name: 'packagename',
        version: 'github:someRepo/someProject#semver:^2',
      },
      resolved: {
        name: 'packagename',
        version: '^2'
      }
    }

    const expected = 'github:someRepo/someProject#semver:4.2.1'

    // NpmVersionUtils
    const actual = NpmUtils.npmReplaceVersion(
      packageInfo,
      '4.2.1'
    )

    assert.equal(actual, expected)
  },

}