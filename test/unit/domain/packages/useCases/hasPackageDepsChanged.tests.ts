import assert from 'assert';
import { PackageDependency, hasPackageDepsChanged } from 'domain/packages';
import { test } from 'mocha-ui-esm';
import Fixtures from './hasPackageDepsChanged.fixtures';

export const getSuggestionProvidersByFileNameTests = {

  [test.title]: hasPackageDepsChanged.name,

  "returns false when original and edited are the same for $1": [
    ["no entries", []],
    ["single entries", Fixtures.single],
    ["multiple entries", Fixtures.multiple],
    function (caseTitle: string, testDeps: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testDeps, testDeps);
      assert.equal(actual, false);
    }
  ],

  "returns false when only $1 name range has changed": [
    ["original single entry", Fixtures.singleWithDiffNameRange, Fixtures.single],
    ["edited single entry", Fixtures.single, Fixtures.singleWithDiffNameRange],
    ["original multiple entries", Fixtures.multipleWithDiffNameRange, Fixtures.multiple],
    ["edited multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffNameRange],
    function (caseTitle: string, testOriginal: PackageDependency[], testEdited: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, testEdited);
      assert.equal(actual, false);
    }
  ],

  "returns false when only $1 version range has changed": [
    ["original single entry", Fixtures.singleWithDiffVersionRange, Fixtures.single],
    ["edited single entry", Fixtures.single, Fixtures.singleWithDiffVersionRange],
    ["original multiple entries", Fixtures.multipleWithDiffVersionRange, Fixtures.multiple],
    ["edited multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffVersionRange],
    function (caseTitle: string, testOriginal: PackageDependency[], testEdited: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, testEdited);
      assert.equal(actual, false);
    }
  ],

  "returns true when $1 items then edited": [
    ["original has less", Fixtures.single, Fixtures.multiple],
    ["edited has less", Fixtures.multiple, Fixtures.single],
    function (caseTitle: string, testOriginal: PackageDependency[], testEdited: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, testEdited);
      assert.equal(actual, true);
    }
  ],

  "returns true when version has changed for $1": [
    ["original single entries", Fixtures.singleWithDiffVersion, Fixtures.single],
    ["edited single entries", Fixtures.single, Fixtures.singleWithDiffVersion],
    ["original multiple entries", Fixtures.multipleWithDiffVersion, Fixtures.multiple],
    ["edited multiple entries", Fixtures.multiple, Fixtures.multipleWithDiffVersion],
    function (caseTitle: string, testOriginal: PackageDependency[], multipleWithDiffVersionRange: PackageDependency[]) {
      const actual = hasPackageDepsChanged(testOriginal, multipleWithDiffVersionRange);
      assert.equal(actual, true);
    }
  ]

};