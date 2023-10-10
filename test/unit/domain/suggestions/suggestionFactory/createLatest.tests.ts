import assert from 'assert';
import {
  SuggestionCategory,
  SuggestionFactory,
  SuggestionStatusText,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/packages';

export const CreateLatestTests = {

  title: SuggestionFactory.createLatestUpdateable.name,

  "when version param is undefined then returns '*' as suggested version": () => {
    const actual = SuggestionFactory.createLatestUpdateable()
    assert.deepEqual(
      actual,
      <TPackageSuggestion>{
        name: SuggestionStatusText.UpdateLatest,
        category: SuggestionCategory.Updateable,
        version: '*',
        type: SuggestionTypes.tag
      });
  },

  "when version param is a release then returns 'latest' status suggestion": () => {
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

  "when version param is a prerelease then returns 'latest prerelease' status suggestion": () => {
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