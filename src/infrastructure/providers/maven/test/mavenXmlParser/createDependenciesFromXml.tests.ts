import assert from 'assert';
import { createDependenciesFromXml, extractReposUrlsFromXml, getVersionsFromPackageXml } from 'infrastructure/providers/maven';
import { test } from 'mocha-ui-esm';
import Fixtures from './createDependenciesFromXml.fixtures';

type TestContext = {
  test: {
    title: string
  }
}

export const createDependenciesFromXmlTests = {

  [test.title]: createDependenciesFromXml.name,

  'returns empty when no matches found with "$1"': [
    [[], ''],
    [["non-dependencies"], Fixtures.createDependenciesFromXml.test],
    function (this: TestContext, testIncludeNames: Array<string>, expected: string) {
      // test
      const actual = createDependenciesFromXml(expected, testIncludeNames);

      // assert
      assert.equal(actual.length, 0);
    }
  ],

  "extracts dependency entries from maven xml": () => {
    // setup
    const includeNames = [
      "project.parent",
      "project.dependencies.dependency",
    ];

    // test
    const actual = createDependenciesFromXml(
      Fixtures.createDependenciesFromXml.test,
      includeNames
    );

    // assert
    assert.deepEqual(actual, Fixtures.createDependenciesFromXml.expected);
  },

  "extracts repositories from mvn cli xml": () => {
    // test
    const actual = extractReposUrlsFromXml(Fixtures.extractReposUrlsFromXml.test);

    // assert
    assert.deepEqual(actual, Fixtures.extractReposUrlsFromXml.expected);
  },

  "extracts versions from maven client xml": () => {
    // test
    const actual = getVersionsFromPackageXml(Fixtures.getVersionsFromPackageXml.test);

    // assert
    assert.deepEqual(actual, Fixtures.getVersionsFromPackageXml.expected);
  }

}