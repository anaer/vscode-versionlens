import assert from 'assert';
import { KeyDictionary } from 'domain/generics';
import {
  extractPackageDependenciesFromJson,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler
} from 'domain/packages';
import {
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode
} from 'domain/packages/parsers/json/jsonPackageTypeFactory';
import { test } from 'mocha-ui-esm';
import Fixtures from './extractPackageDependenciesFromJson.fixtures';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode,
  "path": createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export const extractPackageDependenciesFromJsonTests = {

  [test.title]: extractPackageDependenciesFromJson.name,

  "returns empty when no matches found": () => {
    const includePropNames: Array<string> = []

    const testOptions: TJsonPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = extractPackageDependenciesFromJson(
      "",
      testOptions
    );
    assert.equal(results.length, 0);
  },

  "returns empty when no dependency entry names match": () => {
    const includePropNames = ["non-dependencies"];

    const testOptions: TJsonPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = extractPackageDependenciesFromJson(
      JSON.stringify(Fixtures.extractDependencyEntries.test),
      testOptions
    );

    assert.equal(results.length, 0);
  },

  "extracts dependency entries from json": () => {
    const includePropNames = ["dependencies"];

    const testOptions: TJsonPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = extractPackageDependenciesFromJson(
      JSON.stringify(Fixtures.extractDependencyEntries.test),
      testOptions
    );

    assert.deepEqual(results, Fixtures.extractDependencyEntries.expected);
  },

  "matches json expression paths": () => {
    const includePropNames = ["overrides.*"];

    const testOptions: TJsonPackageParserOptions = {
      includePropNames,
      complexTypeHandlers
    };

    const results = extractPackageDependenciesFromJson(
      JSON.stringify(Fixtures.matchesPathExpressions.test),
      testOptions
    );

    assert.deepEqual(results, Fixtures.matchesPathExpressions.expected);
  }

}