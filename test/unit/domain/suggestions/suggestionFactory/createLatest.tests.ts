import assert from 'assert';
import {
  SuggestionCategory,
  SuggestionFactory,
  SuggestionStatusText,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/suggestions';

export const CreateLatestTests = {

  title: SuggestionFactory.createLatestUpdateable.name,

  "when version param is undefined then returns 'latest' tagged package suggestion": () => {
    const actual = SuggestionFactory.createLatestUpdateable()
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatusText.UpdateLatest,
        category: SuggestionCategory.Updateable,
        version: 'latest',
        type: SuggestionTypes.tag
      });
  },

  "when version param is a release then returns 'latest' version package suggestion": () => {
    const testRelease = '1.0.0';
    const actual = SuggestionFactory.createLatestUpdateable(testRelease)
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatusText.UpdateLatest,
        category: SuggestionCategory.Updateable,
        version: testRelease,
        type: SuggestionTypes.release
      });
  },

  "when version param is a prerelease then returns 'latest' version package suggestion": () => {
    const testPrerelease = '1.0.0-beta.1';
    const actual = SuggestionFactory.createLatestUpdateable(testPrerelease)
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatusText.UpdateLatestPrerelease,
        category: SuggestionCategory.Updateable,
        version: testPrerelease,
        type: SuggestionTypes.prerelease
      });
  },

}