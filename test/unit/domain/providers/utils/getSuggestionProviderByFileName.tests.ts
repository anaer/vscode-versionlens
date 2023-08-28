import assert from 'assert';
import { ILogger } from 'domain/logging';
import { IProvider, IProviderConfig, getProviderByFileName } from 'domain/providers';
import { test } from 'mocha-ui-esm';
import { instance, mock, when } from 'ts-mockito';

type TestContext = {
  testProviders: Array<IProvider>
}

export const getSuggestionProviderByFileNameTests = {

  [test.title]: getProviderByFileName.name,

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
    const actual = getProviderByFileName("package.json", this.testProviders)
    assert.deepEqual(actual, this.testProviders[0]);
  },

  "returns no providers when file pattern does not match": function (this: TestContext) {
    const actual = getProviderByFileName("no-match.json", this.testProviders)
    assert.equal(actual, undefined);
  },

};