import { createDependenciesFromXml } from 'infrastructure/providers/dotnet';

import Fixtures from './createDependenciesFromXml.fixtures';

const assert = require('assert');

export default {

  "returns empty when no matches found": [
    [[], ''],
    [["non-dependencies"], Fixtures.createDependenciesFromXml.test],
    (testIncludeNames, expected) => {
      const results = createDependenciesFromXml(expected, testIncludeNames);
      assert.equal(results.length, 0);
    }
  ],

  "extracts dependency entries from dotnet xml": () => {
    const includeNames = ["Sdk", "PackageReference", "PackageVersion"]
    const results = createDependenciesFromXml(
      Fixtures.createDependenciesFromXml.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.createDependenciesFromXml.expected);
  }

}