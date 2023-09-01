import assert from 'assert';
import {
  createSuggestions,
  SuggestionTypes,
  SuggestionStatus,
  TPackageSuggestion
} from 'domain/suggestions';
import { test } from 'mocha-ui-esm';
import Fixtures from './createSuggestions.fixtures';

export const CreateSuggestionsTests = {

  [test.title]: createSuggestions.name,

  "returns nomatch": {

    "when releases and prereleases are empty": () => {
      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.NoMatch,
          version: '',
          type: SuggestionTypes.status
        }
      ]

      const testRange = '*'
      const testReleases: Array<string> = []
      const testPrereleases: Array<string> = []
      const results = createSuggestions(
        testRange,
        testReleases,
        testPrereleases
      );
      assert.equal(results.length, expected.length);
      assert.equal(results[0].name, expected[0].name);
      assert.equal(results[0].version, expected[0].version);
      assert.equal(results[0].type, expected[0].type);
    },

    "when releases or prereleases do not contain a matching version": () => {

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.NoMatch,
          version: '',
          type: SuggestionTypes.status
        },
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '1.0.0',
          type: SuggestionTypes.release
        }
      ]

      const testRange = '2.0.0'
      const testReleases = ['1.0.0']
      const testPrereleases = ['1.1.0-alpha.1']
      const results = createSuggestions(
        testRange,
        testReleases,
        testPrereleases
      );
      assert.deepEqual(results, expected);
    },
  },

  "when has dist tag suggestion": {
    "and version has no match": {
      "returns 'no match' with latest dist tag suggestion": () => {
        // setup
        const testDistTagLatest = '4.0.0-next';

        const expected = [
          <TPackageSuggestion>{
            name: SuggestionStatus.NoMatch,
            version: '',
            type: SuggestionTypes.status
          },
          <TPackageSuggestion>{
            name: SuggestionStatus.LatestIsPrerelease,
            version: '4.0.0-next',
            type: SuggestionTypes.prerelease
          }
        ]

        const testRange = '4.0.0'
        const testReleases = ['0.0.5', '0.0.6']
        const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

        // test
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases,
          testDistTagLatest
        );

        // assert
        assert.deepEqual(results, expected);
      },
    },
    "version matches dist tag": {
      "returns 'latest'": () => {
        // setup
        const testDistTagVersion = '5.0.0';

        const expected = [
          <TPackageSuggestion>{
            name: SuggestionStatus.Latest,
            version: '5.0.0',
            type: SuggestionTypes.status
          }
        ]

        const testReleases = ['0.0.5', '2.0.0', '5.0.0']
        const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
        const testRange = testDistTagVersion

        // test
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases,
          testDistTagVersion
        );

        // assert
        assert.deepEqual(results, expected);
      }
    }
  },

  "when version is fixed": {
    "has no match": {
      "returns 'no match' with latest suggestions": () => {
        // setup
        const testRange = '0.5.0'
        const testReleases = ['1.0.0']
        const testPrereleases = ['1.1.0-alpha.1']

        // test
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases
        );

        // assert
        assert.deepEqual(results, Fixtures.fixedNoMatchWithLatestSuggestions);
      }
    },
    "is the latest release": {
      "returns 'latest' with latest prerelease suggestions": () => {
        // setup
        const testVersion = '3.0.0';
        const testReleases = ['1.0.0', '2.0.0', '2.1.0', testVersion]
        const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

        // test
        const results = createSuggestions(
          testVersion,
          testReleases,
          testPrereleases
        );

        // assert
        assert.deepEqual(results, Fixtures.fixedIsLatestWithPrereleaseSuggestions);
        assert.equal(results[0].version, testVersion);
      },
      "returns 'latest' with no suggestions": () => {
        // setup
        const testVersion = '3.0.0';
        const testReleases = ['1.0.0', '2.0.0', '2.1.0', testVersion]
        const testPrereleases = ['1.1.0-alpha.1', '3.0.0-next']

        // test
        const results = createSuggestions(
          testVersion,
          testReleases,
          testPrereleases
        );

        // assert
        assert.deepEqual(results, Fixtures.fixedIsLatestNoSuggestions);
        assert.equal(results[0].version, testVersion);
      }
    }
  },
  "when version is a range": {
    "has no match": {
      "returns 'no match' with latest suggestion": () => {
        // setup
        const testRange = '>2.0.0 <3.0.0'
        const testReleases = ['1.0.0', '2.0.0']
        const testPrereleases = ['1.1.0-alpha.1']

        // test
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases
        );

        // assert
        assert.deepEqual(results, Fixtures.rangeNoMatchWithLatestSuggestions);
      }
    },
    "includes the latest release": {
      "$i: returns 'satisfies latest' with latest prerelease suggestions": [
        ['>=2'],
        ['>=2 <=5'],
        ['>=3'],
        ['^3'],
        ['3.*'],
        ['^3.0.0'],
        ['>=3.0.* < 4'],
        (testRange: string) => {
          // setup
          const latestVersion = '3.0.0';
          const testReleases = ['1.0.0', '2.0.0', '2.1.0', latestVersion]
          const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

          // test
          const results = createSuggestions(
            testRange,
            testReleases,
            testPrereleases
          );

          // assert
          assert.deepEqual(results, Fixtures.rangeSatisfiesLatestOnly);
          assert.equal(results[0].version, latestVersion);
        }
      ],
    },
    "doesn't include latest release": {
      "$i: returns 'satisfies' with latest suggestions": [
        ['>=2 <3'],
        ['>=1.2 <2.2.*'],
        (testRange: string) => {
          // setup
          const satisfiesVersion = '2.1.0';
          const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
          const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

          // test
          const results = createSuggestions(
            testRange,
            testReleases,
            testPrereleases
          );

          // assert
          assert.deepEqual(results, Fixtures.rangeSatisfiesAndSuggestsLatest);
          assert.equal(results[0].version, satisfiesVersion);
        }
      ],
    }
  }
}