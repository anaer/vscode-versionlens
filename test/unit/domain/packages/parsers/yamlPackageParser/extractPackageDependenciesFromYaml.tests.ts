import assert from 'assert';

import { extractPackageDependenciesFromYaml } from 'domain/packages';

import Fixtures from './extractPackageDependenciesFromYaml.fixtures';

export const extractPackageDependenciesFromYamlTests = {

  title: extractPackageDependenciesFromYaml.name,

  "returns empty when no matches found": () => {
    const includeNames = []
    const results = extractPackageDependenciesFromYaml('', includeNames);
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const includeNames = ["non-dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractDependencyEntries.test,
      includeNames
    );
    assert.equal(results.length, 0);
  },

  "extracts dependency entries from yaml": () => {
    const includeNames = ["dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractDependencyEntries.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.extractDependencyEntries.expected);
  }

}