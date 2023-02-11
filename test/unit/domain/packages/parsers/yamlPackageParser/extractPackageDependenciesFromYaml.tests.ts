import assert from 'assert';
import { extractPackageDependenciesFromYaml } from 'domain/packages';
import { test } from 'mocha-ui-esm';
import Fixtures from './extractPackageDependenciesFromYaml.fixtures';

export const extractPackageDependenciesFromYamlTests = {

  [test.title]: extractPackageDependenciesFromYaml.name,

  "returns empty when no matches found": () => {
    const includeNames = []
    const results = extractPackageDependenciesFromYaml(
      "",
      includeNames
    );
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

  "extracts general dependencies from yaml": () => {
    const includeNames = ["dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractDependencyEntries.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.extractDependencyEntries.expected);
  },

  "extracts path type dependencies from yaml": () => {
    const includeNames = ["dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractPathDependencies.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.extractPathDependencies.expected);
  },

  "extracts git type dependencies from yaml": () => {
    const includeNames = ["dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractGitDepencdencies.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.extractGitDepencdencies.expected);
  },

  "extracts hosted type dependencies from yaml": () => {
    const includeNames = ["dependencies"]
    const results = extractPackageDependenciesFromYaml(
      Fixtures.extractHostedDependencies.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.extractHostedDependencies.expected);
  }
}