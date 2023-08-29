import assert from 'assert';
import {
  SuggestionFactory,
  SuggestionStatus,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/suggestions';

export const CreateFromHttpStatusTests = {

  title: SuggestionFactory.createFromHttpStatus.name,

  "returns suggestions from implemented http status $1": [
    [
      400,
      <TPackageSuggestion>{
        name: SuggestionStatus.BadRequest,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      401,
      <TPackageSuggestion>{
        name: SuggestionStatus.NotAuthorized,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      403,
      <TPackageSuggestion>{
        name: SuggestionStatus.Forbidden,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      404,
      <TPackageSuggestion>{
        name: SuggestionStatus.NotFound,
        version: '',
        type: SuggestionTypes.status
      }
    ],
    [
      500,
      <TPackageSuggestion>{
        name: SuggestionStatus.InternalServerError,
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