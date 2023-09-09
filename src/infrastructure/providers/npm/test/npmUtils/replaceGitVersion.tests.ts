import assert from 'assert';
import {
  PackageResponse,
  PackageSourceType,
  createDependencyRange
} from 'domain/packages';
import { SuggestionTypes, mapToSuggestionUpdate } from 'domain/suggestions';
import { NpmUtils } from 'infrastructure/providers/npm';
import { test } from 'mocha-ui-esm';

export const npmReplaceVersionTests = {

  [test.title]: NpmUtils.npmReplaceVersion.name,

  "handles #tag|commit|semver:": () => {
    const packageInfo: PackageResponse = {
      providerName: 'testreplace',
      packageSource: PackageSourceType.Github,
      nameRange: createDependencyRange(0, 0),
      versionRange: createDependencyRange(1, 1),
      order: 0,
      parsedPackage: {
        path: 'packagepath',
        name: 'packagename',
        version: 'github:someRepo/someProject#semver:^2',
      },
      fetchedPackage: {
        name: 'packagename',
        version: '^2'
      },
      suggestion: {
        name: 'packagename',
        type: SuggestionTypes.release,
        version: '4.2.1'
      }
    }

    const expected = 'github:someRepo/someProject#semver:4.2.1'

    // NpmVersionUtils
    const actual = NpmUtils.npmReplaceVersion(mapToSuggestionUpdate(packageInfo))

    assert.equal(actual, expected)
  },

}