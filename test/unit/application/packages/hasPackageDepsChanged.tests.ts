import { hasPackageDepsChanged } from 'application/packages';
import assert from 'assert';
import { PackageDependency } from 'domain/packages';
import { test } from 'mocha-ui-esm';
import Fixtures from './hasPackageDepsChanged.fixtures';

export const getSuggestionProvidersByFileNameTests = {

  [test.title]: hasPackageDepsChanged.name,

  "returns false when original and recent are the same for $1": [
    ["no entries", []],
    ["single entries", Fixtures.single],
    ["multiple entries", Fixtures.multiple],
    function (caseTitle, testDeps: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testDeps, testDeps);
      assert.equal(actual, false);
    }
  ],

  "returns false when only $1 name range has changed": [
    ["original single entry", Fixtures.singleWithDiffNameRange, Fixtures.single],
    ["recent single entry", Fixtures.single, Fixtures.singleWithDiffNameRange],
    ["original multiple entries", Fixtures.multipleWithDiffNameRange, Fixtures.multiple],
    ["recent multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffNameRange],
    function (caseTitle, testOriginal: PackageDependency[], testRecent: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, testRecent);
      assert.equal(actual, false);
    }
  ],

  "returns false when only $1 version range has changed": [
    ["original single entry", Fixtures.singleWithDiffVersionRange, Fixtures.single],
    ["recent single entry", Fixtures.single, Fixtures.singleWithDiffVersionRange],
    ["original multiple entries", Fixtures.multipleWithDiffVersionRange, Fixtures.multiple],
    ["recent multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffVersionRange],
    function (caseTitle, testOriginal: PackageDependency[], testRecent: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, testRecent);
      assert.equal(actual, false);
    }
  ],

  "returns true when $1 items then recent": [
    ["original has less", Fixtures.single, Fixtures.multiple],
    ["recent has less", Fixtures.multiple, Fixtures.single],
    function (caseTitle, testOriginal, testRecent) {
      const actual = hasPackageDepsChanged(testOriginal, testRecent);
      assert.equal(actual, true);
    }
  ],

  "returns true when version has changed for $1": [
    ["original single entries", Fixtures.singleWithDiffVersion, Fixtures.single],
    ["recent single entries", Fixtures.single, Fixtures.singleWithDiffVersion],
    ["original multiple entries", Fixtures.multipleWithDiffVersion, Fixtures.multiple],
    ["recent multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffVersion],
    function (caseTitle, testOriginal, testRecent) {
      const actual = hasPackageDepsChanged(testOriginal, testRecent);
      assert.equal(actual, true);
    }
  ]

};