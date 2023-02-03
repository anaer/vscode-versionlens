import assert from 'assert';
import {
  ClientResponseSource,
  IJsonHttpClient,
  JsonHttpClient
} from 'domain/clients';
import { SuggestionFlags } from 'domain/suggestions';
import {
  GitHubClient,
  GitHubOptions,
  NpmConfig
} from 'infrastructure/providers/npm';
import npa from 'npm-package-arg';
import { LoggerStub } from 'test/unit/domain/logging/index.test';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import { githubFixtures } from './fetchGitHub.fixtures';

let githubOptsMock: GitHubOptions;
let configMock: NpmConfig;
let loggerMock: LoggerStub;
let jsonClientMock: IJsonHttpClient;

export const fetchGithubTests = {

  title: GitHubClient.prototype.fetchGithub.name,

  beforeEach: () => {
    githubOptsMock = mock(GitHubOptions);
    configMock = mock(NpmConfig);
    jsonClientMock = mock(JsonHttpClient);
    loggerMock = mock(LoggerStub);

    when(configMock.github).thenReturn(instance(githubOptsMock))
  },

  'returns a #semver:x.x.x. package': async () => {
    const testRequest: any = {
      providerName: 'testnpmprovider',
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'github:octokit/core.js#semver:^2',
      }
    };

    const testSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(jsonClientMock.request(anything(), anything(), anything(), anything()))
      .thenResolve({
        status: 200,
        data: githubFixtures.tags,
        source: ClientResponseSource.remote
      })

    // setup initial call
    const cut = new GitHubClient(
      instance(configMock),
      instance(jsonClientMock),
      instance(loggerMock)
    );

    return cut.fetchGithub(testRequest, <any>testSpec)
      .then((actual) => {
        assert.equal(actual.source, 'github')
        assert.equal(actual.type, 'range')
        assert.equal(actual.resolved.name, testRequest.package.name)

        assert.deepEqual(
          actual.suggestions,
          [{
            name: 'satisfies',
            version: 'latest',
            flags: SuggestionFlags.status
          }, {
            name: 'latest',
            version: 'v2.5.0',
            flags: SuggestionFlags.release
          }, {
            name: 'rc',
            version: 'v2.6.0-rc.1',
            flags: SuggestionFlags.prerelease
          }, {
            name: 'preview',
            version: 'v2.5.0-preview.1',
            flags: SuggestionFlags.prerelease
          }]
        )
      })
  },

  'returns a #x.x.x': async () => {

    const testRequest: any = {
      providerName: 'testnpmprovider',
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'github:octokit/core.js#v2.0.0',
      }
    };

    const testSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(jsonClientMock.request(anything(), anything(), anything(), anything()))
      .thenResolve({
        status: 200,
        data: githubFixtures.tags,
        source: ClientResponseSource.remote
      })

    // setup initial call
    const cut = new GitHubClient(
      instance(configMock),
      instance(jsonClientMock),
      instance(loggerMock)
    );

    return cut.fetchGithub(testRequest, testSpec)
      .then((actual) => {
        assert.equal(actual.source, 'github')
        assert.equal(actual.type, 'range')
        assert.equal(actual.resolved.name, testRequest.package.name)

        assert.deepEqual(
          actual.suggestions,
          [{
            name: 'fixed',
            version: 'v2.0.0',
            flags: SuggestionFlags.status
          }, {
            name: 'latest',
            version: 'v2.5.0',
            flags: SuggestionFlags.release
          }, {
            name: 'rc',
            version: 'v2.6.0-rc.1',
            flags: SuggestionFlags.prerelease
          }, {
            name: 'preview',
            version: 'v2.5.0-preview.1',
            flags: SuggestionFlags.prerelease
          }]
        )
      })
  },

  'returns a #sha commit': async () => {

    const testRequest: any = {
      providerName: 'testnpmprovider',
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'github:octokit/core.js#166c3497',
      }
    };

    const testSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    when(jsonClientMock.request(anything(), anything(), anything(), anything()))
      .thenResolve({
        status: 200,
        data: githubFixtures.commits,
        source: ClientResponseSource.remote
      })

    const cut = new GitHubClient(
      instance(configMock),
      instance(jsonClientMock),
      instance(loggerMock)
    );

    return cut.fetchGithub(testRequest, testSpec)
      .then((actual) => {
        assert.equal(actual.source, 'github')
        assert.equal(actual.type, 'committish')
        assert.equal(actual.resolved.name, testRequest.package.name)

        assert.deepEqual(
          actual.suggestions,
          [{
            name: 'fixed',
            version: '166c3497',
            flags: SuggestionFlags.status
          }, {
            name: 'latest',
            version: 'df4d9435',
            flags: SuggestionFlags.release
          }]
        )
      })
  },

  'sets auth token in headers': async () => {

    const testRequest: any = {
      providerName: 'testnpmprovider',
      package: {
        path: 'packagepath',
        name: 'core.js',
        version: 'github:octokit/core.js#166c3497',
      }
    };

    const testSpec = npa.resolve(
      testRequest.package.name,
      testRequest.package.version,
      testRequest.package.path
    );

    const testToken = 'testToken';

    when(jsonClientMock.request(anything(), anything(), anything(), anything()))
      .thenResolve({
        status: 200,
        data: githubFixtures.commits,
        source: ClientResponseSource.remote
      })

    when(githubOptsMock.accessToken).thenReturn(testToken);

    const cut = new GitHubClient(
      instance(configMock),
      instance(jsonClientMock),
      instance(loggerMock)
    );

    await cut.fetchGithub(testRequest, testSpec)

    const [, , , actualHeaders] = capture(jsonClientMock.request).first();
    assert.equal(actualHeaders['authorization'], 'token ' + testToken);
  }

}