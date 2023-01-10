import assert from 'assert';
import {
  SuggestionFactory,
  SuggestionFlags
} from 'domain/suggestions';

export default {

  "createFromHttpStatus": {

    "returns suggestions from implemented http statuses": () => {

      const tests = [
        {
          testStatus: 401,
          expected: {
            name: '401 not authorized',
            version: '',
            flags: SuggestionFlags.status
          }
        },
        {
          testStatus: 404,
          expected: {
            name: 'package not found',
            version: '',
            flags: SuggestionFlags.status
          }
        }
      ]

      tests.forEach(
        test => {
          const actual = SuggestionFactory.createFromHttpStatus(test.testStatus)
          assert.deepEqual(actual, test.expected)
        }
      )

    },

    "returns null when http status not implemented": () => {
      const actual = SuggestionFactory.createFromHttpStatus(501)
      assert.deepEqual(actual, null)
    }

  },

}