import assert from 'assert';
import { VersionUtils } from 'domain/packages';

const testPrereleases = [
  '4.1.0-beta.1',
  '2.1.0-legacy.1',
  '2.5.0-release.1',
]

export const friendlifyPrereleaseNameTests = {

  title: VersionUtils.friendlifyPrereleaseName.name,

  "returns null name when no matches found": () => {
    const result = VersionUtils.friendlifyPrereleaseName('2.5.0-tag.1');
    assert.equal(result, null);
  },

  "returns common prerelease name when match found": () => {
    const expected = [
      'beta',
      'legacy',
      'release',
    ]
    expected.forEach((expectedValue, index) => {
      const actual = VersionUtils.friendlifyPrereleaseName(testPrereleases[index])
      assert.equal(actual, expectedValue);
    })
  },

}