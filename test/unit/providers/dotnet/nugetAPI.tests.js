/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { parseVersionSpec, convertNugetToNodeRange } from '../../../../src/providers/dotnet/nugetAPI.js';

describe('NugetAPI', () => {

  describe('parseVersionSpec', () => {

    it('No nulls from valid notations', () => {
      // spec https://docs.microsoft.com/en-us/nuget/create-packages/dependency-versions#version-ranges
      const results = [
        parseVersionSpec("1.0.0"),
        parseVersionSpec("(1.0.0,)"),
        parseVersionSpec("[1.0.0]"),
        parseVersionSpec("(,1.0.0]"),
        parseVersionSpec("(,1.0.0)"),
        parseVersionSpec("[1.0.0,2.0.0]"),
        parseVersionSpec("(1.0.0,2.0.0)"),
        parseVersionSpec("[1.0.0,2.0.0)"),
        parseVersionSpec("(1.0.0)")   // should be null though
      ];

      results.forEach(x => {
        assert.ok(!!x, "Could not parse range")
      })
    });

    it('returns nulls from invalid notations', () => {
      const results = [
        parseVersionSpec("1."),
        parseVersionSpec("1.0."),
        parseVersionSpec("s.2.0"),
        parseVersionSpec("beta")
      ];

      results.forEach(x => {
        assert.ok(!x, "Could not parse range")
      })
    });
  });

  describe('convertNugetToNodeRange', () => {

    it('converts basic nuget ranges to node ranges', () => {
      const expectedList = [
        // basic
        "1.0.0", "1.0.0",
        "(1.0.0,)", ">1.0.0",
        "[1.0.0]", "1.0.0",
        "(,1.0.0]", "<=1.0.0",
        "[1.0.0,2.0.0]", ">=1.0.0 <=2.0.0",
        "(1.0.0,2.0.0)", ">1.0.0 <2.0.0",
        "[1.0.0,2.0.0)", ">=1.0.0 <2.0.0"
      ];

      for (let i = 0; i < expectedList.length; i += 2) {
        const test = expectedList[i];
        const expected = expectedList[i + 1];
        const actual = convertNugetToNodeRange(test);
        assert.equal(actual, expected, "nuget range did not convert to node range at " + i);
      }
    });

    it('converts partial nuget ranges to node ranges', () => {
      const expectedList = [
        "1", "1.0.0",
        "1.0", "1.0.0",
        "[1,2]", ">=1.0.0 <=2.0.0",
        "(1,2)", ">1.0.0 <2.0.0",
      ];

      for (let i = 0; i < expectedList.length; i += 2) {
        const test = expectedList[i];
        const expected = expectedList[i + 1];
        const actual = convertNugetToNodeRange(test);
        assert.equal(actual, expected, `nuget range did not convert ${expected} to ${actual} at ${i}`);
      }
    });

    it('returns null for invalid ranges', () => {
      const results = [
        parseVersionSpec("1."),
        parseVersionSpec("1.0."),
        parseVersionSpec("s.2.0"),
        parseVersionSpec("beta"),
        parseVersionSpec("[1.*]"),
        parseVersionSpec("[1.0.*,2.0.0)")
      ];

      results.forEach(x => {
        assert.ok(!x, "Should not parse range")
      })
    });

    it('handles floating ranges', () => {
      const expectedList = [
        "1.*", ">=1.0.0 <2.0.0",
        "1.0.*", ">=1.0.0 <1.1.0"
      ];

      for (let i = 0; i < expectedList.length; i += 2) {
        const test = expectedList[i];
        const expected = expectedList[i + 1];
        const actual = convertNugetToNodeRange(test);
        assert.equal(actual, expected, `nuget floating range did not convert ${expected} to ${actual} at ${i}`);
      }
    });

  });

});