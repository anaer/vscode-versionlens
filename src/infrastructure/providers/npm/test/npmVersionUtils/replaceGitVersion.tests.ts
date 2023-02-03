import assert from 'assert';
import { PackageResponse, PackageSourceType } from 'domain/packages';
import * as NpmUtils from 'infrastructure/providers/npm';

export const npmReplaceVersionTests = {

  title: NpmUtils.npmReplaceVersion.name,

  "handles #tag|commit|semver:": () => {
    const packageInfo: PackageResponse = {
      providerName: 'testreplace',
      source: PackageSourceType.Github,
      nameRange: null,
      versionRange: null,
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