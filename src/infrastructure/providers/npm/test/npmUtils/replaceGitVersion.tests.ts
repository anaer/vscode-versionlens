import assert from 'assert';
import {
  PackageResponse,
  PackageSourceType,
  SuggestionCategory,
  SuggestionTypes,
  createDependencyRange,
  mapToSuggestionUpdate
} from 'domain/packages';
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
        category: SuggestionCategory.Updateable,
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