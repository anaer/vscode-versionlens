import assert from 'assert';
import {
  createGitDescFromYamlNode,
  createHostedDescFromYamlNode,
  createPathDescFromYamlNode,
  createVersionDescFromYamlNode,
  parsePackagesYaml,
  TYamlPackageParserOptions,
  TYamlPackageTypeHandler
} from 'domain/packages';
import { KeyDictionary } from 'domain/utils';
import { test } from 'mocha-ui-esm';
import Fixtures from './extractPackageDependenciesFromYaml.fixtures';

const complexTypeHandlers = <KeyDictionary<TYamlPackageTypeHandler>>{
  "version": createVersionDescFromYamlNode,
  "path": createPathDescFromYamlNode,
  "hosted": createHostedDescFromYamlNode,
  "git": createGitDescFromYamlNode
}

export const extractPackageDependenciesFromYamlTests = {

  [test.title]: parsePackagesYaml.name,

  "returns empty when no matches found": () => {
    const includePropNames: Array<string> = [];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      "",
      testOptions
    );
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const includePropNames = ["non-dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.extractDependencyEntries.test,
      testOptions
    );

    assert.equal(results.length, 0);
  },

  "extracts general dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.extractDependencyEntries.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.extractDependencyEntries.expected);
  },

  "extracts path type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.extractPathDependencies.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.extractPathDependencies.expected);
  },

  "extracts git type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.extractGitDepencdencies.test,
      testOptions
    );
    assert.deepEqual(results, Fixtures.extractGitDepencdencies.expected);
  },

  "extracts hosted type dependencies from yaml": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TYamlPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = parsePackagesYaml(
      Fixtures.extractHostedDependencies.test,
      testOptions
    );

    assert.deepEqual(results, Fixtures.extractHostedDependencies.expected);
  }
}