/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { splitReleasesFromArray } from 'core/common/helpers/versionHelpers';

const assert = require('assert');

const testVersions = [
  '1.0.0',
  '2.0.0',
  '2.0.0-beta.1',
  '9.5.12',
  '11.1.9',
  '12.0.0-next.1',
]

export default {

  "returns empty when no matches found": () => {
    const { releases, prereleases } = splitReleasesFromArray([]);
    assert.equal(releases.length, 0);
    assert.equal(prereleases.length, 0);
  },

  "returns mapped PackageNameVersion array": () => {
    const expectedReleases = [
      '1.0.0',
      '2.0.0',
      '9.5.12',
      '11.1.9',
    ]
    const expectedPrereleases = [
      '2.0.0-beta.1',
      '12.0.0-next.1',
    ]
    const { releases, prereleases } = splitReleasesFromArray(testVersions);
    assert.equal(releases.length, expectedReleases.length);

    expectedReleases.forEach((expectedVersion, index) => {
      assert.equal(releases[index], expectedVersion);
    })

    expectedPrereleases.forEach((expectedVersion, index) => {
      assert.equal(prereleases[index], expectedVersion);
    })
  }

}