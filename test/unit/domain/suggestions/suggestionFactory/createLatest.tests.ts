import assert from 'assert';
import {
  SuggestionFactory,
  SuggestionStatus,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/suggestions';

export const CreateLatestTests = {

  title: SuggestionFactory.createLatest.name,

  "when version param is undefined then returns 'latest' tagged package suggestion": () => {
    const actual = SuggestionFactory.createLatest()
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatus.Latest,
        version: SuggestionStatus.Latest,
        type: SuggestionTypes.tag
      });
  },

  "when version param is a release then returns 'latest' version package suggestion": () => {
    const testRelease = '1.0.0';
    const actual = SuggestionFactory.createLatest(testRelease)
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatus.Latest,
        version: testRelease,
        type: SuggestionTypes.release
      });
  },

  "when version param is a prerelease then returns 'latest' version package suggestion": () => {
    const testPrerelease = '1.0.0-beta.1';
    const actual = SuggestionFactory.createLatest(testPrerelease)
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatus.LatestIsPrerelease,
        version: testPrerelease,
        type: SuggestionTypes.prerelease
      });
  },

}