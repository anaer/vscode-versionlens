import assert from 'assert';
import {
  createSuggestions,
  SuggestionTypes,
  SuggestionStatus,
  TPackageSuggestion
} from 'domain/suggestions';
import { test } from 'mocha-ui-esm';

export const CreateSuggestionsTests = {

  [test.title]: createSuggestions.name,

  "returns PackageVersionStatus.nomatch": {

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

    "when using a release range": () => {
      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.NoMatch,
          version: '',
          type: SuggestionTypes.status
        },
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '1.0.3-1.2.3',
          type: SuggestionTypes.release
        }
      ]

      const testRange = '^1.0.0'
      const testReleases = ['0.0.6']
      const testPrereleases = ['1.0.1-1.2.3', '1.0.2-1.2.3', '1.0.3-1.2.3']
      const results = createSuggestions(
        testRange,
        testReleases,
        testPrereleases,
        '1.0.3-1.2.3'
      );
      assert.equal(results.length, expected.length);
    },

  },

  "returns PackageVersionStatus.Latest": {

    "when versionRange matches the latest release": () => {

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '',
          type: SuggestionTypes.status
        },
        <TPackageSuggestion>{
          name: 'next',
          version: '4.0.0-next',
          type: SuggestionTypes.prerelease
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRanges = [
        '3.0.0',
        '^3.0.0'
      ]

      testRanges.forEach(testRange => {
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases
        );
        assert.deepEqual(results, expected);
      })

    },

    "when suggestedVersion is the latest release": () => {
      const testSuggestedVersion = '5.0.0';

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '',
          type: SuggestionTypes.status
        }
      ]

      const testReleases = ['0.0.5', '2.0.0', '5.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRange = testSuggestedVersion

      const results = createSuggestions(
        testRange,
        testReleases,
        testPrereleases,
        testSuggestedVersion
      );
      assert.deepEqual(results, expected);
    },

  },

  "returns PackageVersionStatus.LatestIsPrerelease": {

    "when suggestedVersion is not the latest release": () => {
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

      const testReleases = ['0.0.5', '0.0.6']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRange = '4.0.0'

      const results = createSuggestions(
        testRange,
        testReleases,
        testPrereleases,
        testDistTagLatest
      );
      assert.deepEqual(results, expected);
    },

  },

  "returns PackageVersionStatus.satisfies": {

    "when versionRange satisfies the latest release": () => {

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.Satisfies,
          version: 'latest',
          type: SuggestionTypes.status
        },
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '3.0.0',
          type: SuggestionTypes.release
        },
        <TPackageSuggestion>{
          name: 'next',
          version: '4.0.0-next',
          type: SuggestionTypes.prerelease
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']

      const results = createSuggestions(
        '>=2',
        testReleases,
        testPrereleases
      );

      assert.deepEqual(results, expected);
    },

    "when versionRange satisfies the latest tagged release": () => {
      const testLatest = '7.10.1'

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.Satisfies,
          version: 'latest',
          type: SuggestionTypes.status
        },
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: testLatest,
          type: SuggestionTypes.release
        },
        <TPackageSuggestion>{
          name: 'next',
          version: '8.0.0-next',
          type: SuggestionTypes.prerelease
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '7.9.6', '7.9.7', testLatest]
      const testPrereleases = ['1.1.0-alpha.1', '8.0.0-next']

      const results = createSuggestions(
        '^7.9.1',
        testReleases,
        testPrereleases,
        testLatest
      );

      assert.deepEqual(results, expected);
    },
    "when versionRange satisfies a range in the releases": () => {

      const expected = [
        <TPackageSuggestion>{
          name: SuggestionStatus.Satisfies,
          version: '2.1.0',
          type: SuggestionTypes.release
        },
        <TPackageSuggestion>{
          name: SuggestionStatus.Latest,
          version: '3.0.0',
          type: SuggestionTypes.release
        },
        <TPackageSuggestion>{
          name: 'next',
          version: '4.0.0-next',
          type: SuggestionTypes.prerelease
        }
      ]

      const testReleases = ['1.0.0', '2.0.0', '2.1.0', '3.0.0']
      const testPrereleases = ['1.1.0-alpha.1', '4.0.0-next']
      const testRanges = [
        '2.*'
      ]

      testRanges.forEach(testRange => {
        const results = createSuggestions(
          testRange,
          testReleases,
          testPrereleases
        );
        assert.deepEqual(results, expected);
      })

    },

  },

}