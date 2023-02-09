import assert from 'assert';
import { VersionHelpers } from 'domain/packages';

export const isFourSegmentedVersionTests = {

  title: VersionHelpers.isFourSegmentedVersion.name,

  "returns false for semver versions $1": [
    '~1.2.3',
    '^4.5.6-beta',
    '1.2.*',
    '>=1.2',
    '*',
    (testVersion) => {
      const actual1 = VersionHelpers.isFourSegmentedVersion(testVersion)
      assert.equal(actual1, false);
    }
  ],

  "returns true for four segment versions $1": [
    '1.2.3.4',
    '1.0.1.1',
    '1.0.0.10',
    (testVersion) => {
      const actual1 = VersionHelpers.isFourSegmentedVersion(testVersion)
      assert.ok(actual1);
    }
  ],

}