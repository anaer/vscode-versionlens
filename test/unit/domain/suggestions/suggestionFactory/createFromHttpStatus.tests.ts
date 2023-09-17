import assert from 'assert';
import {
  SuggestionCategory,
  SuggestionFactory,
  SuggestionStatusText,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/packages';

export const CreateFromHttpStatusTests = {

  title: SuggestionFactory.createFromHttpStatus.name,

  "returns suggestions from implemented http status $1": [
    [
      400,
      <TPackageSuggestion>{
        name: SuggestionStatusText.BadRequest,
        category: SuggestionCategory.Error,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      401,
      <TPackageSuggestion>{
        name: SuggestionStatusText.NotAuthorized,
        category: SuggestionCategory.Error,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      403,
      <TPackageSuggestion>{
        name: SuggestionStatusText.Forbidden,
        category: SuggestionCategory.Error,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      404,
      <TPackageSuggestion>{
        name: SuggestionStatusText.NotFound,
        category: SuggestionCategory.Error,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      500,
      <TPackageSuggestion>{
        name: SuggestionStatusText.InternalServerError,
        category: SuggestionCategory.Error,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    (testStatus: number, expected: TPackageSuggestion) => {
      const actual = SuggestionFactory.createFromHttpStatus(testStatus)
      assert.deepEqual(actual, expected)
    }
  ],

  "returns null when http status not implemented": () => {
    const actual = SuggestionFactory.createFromHttpStatus(501)
    assert.deepEqual(actual, null)
  }

}