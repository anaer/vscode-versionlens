import { getProvidersByFileName } from 'application/providers';
import assert from 'assert';
import { IProvider } from 'domain/providers';
import { test } from 'mocha-ui-esm';

export const getSuggestionProvidersByFileNameTests = {

  [test.title]: getProvidersByFileName.name,

  beforeEach: function () {
    this.testProviders = <IProvider[]>[
      {
        config: {
          config: null,
          caching: null,
          http: null,
          providerName: "test",
          supports: [],
          fileMatcher: {
            pattern: '**/package.json'
          }
        },
        logger: null
      }
    ]
  },

  "returns provider by file pattern": function () {
    const actual = getProvidersByFileName("package.json", this.testProviders)
    assert.equal(actual.length, 1);
    assert.deepEqual(actual, this.testProviders);
  },

  "returns no providers when file pattern does not match": function () {
    const actual = getProvidersByFileName("no-match.json", this.testProviders)
    assert.equal(actual.length, 0);
  },

};