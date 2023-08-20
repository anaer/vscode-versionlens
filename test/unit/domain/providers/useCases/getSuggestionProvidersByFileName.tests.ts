import assert from 'assert';
import { ILogger } from 'domain/logging';
import { IProvider, IProviderConfig, getProvidersByFileName } from 'domain/providers';
import { test } from 'mocha-ui-esm';
import { instance, mock, when } from 'ts-mockito';

type TestContext = {
  testProviders: Array<IProvider>
}

export const getSuggestionProvidersByFileNameTests = {

  [test.title]: getProvidersByFileName.name,

  beforeEach: function (this: TestContext) {
    const mockLogger = mock<ILogger>();
    const mockConfig = mock<IProviderConfig>();
    when(mockConfig.providerName).thenReturn("test");
    when(mockConfig.fileMatcher).thenReturn({
      language: "json",
      scheme: "file",
      pattern: "**/package.json"
    });

    this.testProviders = [{
      config: instance(mockConfig),
      logger: instance(mockLogger)
    }]
  },

  "returns provider by file pattern": function (this: TestContext) {
    const actual = getProvidersByFileName("package.json", this.testProviders)
    assert.equal(actual.length, 1);
    assert.deepEqual(actual, this.testProviders);
  },

  "returns no providers when file pattern does not match": function (this: TestContext) {
    const actual = getProvidersByFileName("no-match.json", this.testProviders)
    assert.equal(actual.length, 0);
  },

};