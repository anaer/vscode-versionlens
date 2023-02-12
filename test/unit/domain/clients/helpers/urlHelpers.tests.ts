import assert from 'assert';
import { UrlHelpers } from 'domain/clients';
import { test } from 'mocha-ui-esm';

export const UrlHelpersTests = {

  [test.title]: "UrlHelpers",

  getProtocolFromUrl: {

    "parses $2 protocols": [
      ['http://test.url.example/path', UrlHelpers.RegistryProtocols.http],
      ['https://test.url.example/path', UrlHelpers.RegistryProtocols.https],
      (testUrl: string, expectedProtocol: string) => {
        const actual = UrlHelpers.getProtocolFromUrl(testUrl)
        assert.equal(actual, expectedProtocol, "Protocol did not match")
      }
    ],

    "parses file protocols for $1": [
      ['d:\\some\\path'],
      ['/d/some/path'],
      (testFolder: string) => {
        const actual = UrlHelpers.getProtocolFromUrl(testFolder)
        assert.equal(actual, UrlHelpers.RegistryProtocols.file, "Protocol did not match")
      }
    ],

  },

  ensureEndSlash: {

    "appends missing slashes for $1": [
      ['https://test1.url.example', 'https://test1.url.example/'],
      ['https://test2.url.example/', 'https://test2.url.example/'],
      (testUrl: string, expectedUrl: string) => {
        const actual = UrlHelpers.ensureEndSlash(testUrl)
        assert.equal(actual, expectedUrl, "End slash did not match")
      },
    ]

  },

};