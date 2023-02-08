import {
  HttpClientRequestMethods,
  IJsonHttpClient,
  JsonClientResponse
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  PackageClientSourceType,
  PackageVersionType,
  TPackageClientResponse,
  VersionHelpers
} from 'domain/packages';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import semver from 'semver';
import { NpaSpec } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';

const defaultHeaders = {
  accept: 'application\/vnd.github.v3+json',
  'user-agent': 'vscode-contrib/vscode-versionlens'
};

export class GitHubClient {

  config: NpmConfig;

  logger: ILogger;

  jsonClient: IJsonHttpClient;

  constructor(config: NpmConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.jsonClient = client;
    this.logger = logger;
  }

  fetchGithub(npaSpec: NpaSpec): Promise<TPackageClientResponse> {
    const { validRange } = semver;

    if (npaSpec.gitRange) {
      // we have a semver:x.x.x
      return this.fetchTags(npaSpec);
    }

    if (validRange(npaSpec.gitCommittish, VersionHelpers.loosePrereleases)) {
      // we have a #x.x.x
      npaSpec.gitRange = npaSpec.gitCommittish;
      return this.fetchTags(npaSpec);
    }

    // we have a #commit
    return this.fetchCommits(npaSpec);
  }

  fetchTags(npaSpec: NpaSpec): Promise<TPackageClientResponse> {
    // todo pass in auth
    const { user, project } = npaSpec.hosted;
    const tagsRepoUrl = `https://api.github.com/repos/${user}/${project}/tags`;
    const query = {};
    const headers = this.getHeaders();

    return this.jsonClient.request(
      HttpClientRequestMethods.get,
      tagsRepoUrl,
      query,
      headers
    )
      .then(function (clientResponse: JsonClientResponse): TPackageClientResponse {
        const { compareLoose } = semver;

        // extract versions
        const tags = <[]>clientResponse.data;

        const rawVersions = tags.map((tag: any) => tag.name);

        const allVersions = VersionHelpers.filterSemverVersions(rawVersions).sort(compareLoose);

        const source: PackageClientSourceType = PackageClientSourceType.Github;

        const type: PackageVersionType = npaSpec.gitRange ?
          PackageVersionType.Range :
          PackageVersionType.Version;

        const versionRange = npaSpec.gitRange;

        const resolved = {
          name: project,
          version: versionRange,
        };

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          allVersions
        );

        // analyse suggestions
        const suggestions = createSuggestions(
          versionRange,
          releases,
          prereleases
        );

        return {
          source,
          responseStatus: {
            source: clientResponse.source,
            status: clientResponse.status
          },
          type,
          resolved,
          suggestions
        };

      });

  }

  fetchCommits(npaSpec: NpaSpec): Promise<TPackageClientResponse> {
    // todo pass in auth
    const { user, project } = npaSpec.hosted;
    const commitsRepoUrl = `https://api.github.com/repos/${user}/${project}/commits`;
    const query = {};
    const headers = this.getHeaders();

    return this.jsonClient.request(
      HttpClientRequestMethods.get,
      commitsRepoUrl,
      query,
      headers
    )
      .then((clientResponse: JsonClientResponse): TPackageClientResponse => {

        const commitInfos = <[]>clientResponse.data

        const commits = commitInfos.map((commit: any) => commit.sha);

        const source: PackageClientSourceType = PackageClientSourceType.Github;

        const type = PackageVersionType.Committish;

        const versionRange = npaSpec.gitCommittish;

        if (commits.length === 0) {
          // no commits found
          return ClientResponseFactory.create(
            PackageClientSourceType.Github,
            clientResponse,
            [SuggestionFactory.createNotFound()]
          )
        }

        const commitIndex = commits.findIndex(
          commit => commit.indexOf(versionRange) > -1
        );

        const latestCommit = commits[commits.length - 1].substr(0, 8);

        const noMatch = commitIndex === -1;

        const isLatest = versionRange === latestCommit;

        const resolved = {
          name: project,
          version: versionRange,
        };

        const suggestions = [];

        if (noMatch) {
          suggestions.push(
            SuggestionFactory.createNoMatch(),
            SuggestionFactory.createLatest(latestCommit)
          );
        } else if (isLatest) {
          suggestions.push(
            SuggestionFactory.createMatchesLatest(versionRange)
          );
        } else if (commitIndex > 0) {
          suggestions.push(
            SuggestionFactory.createFixedStatus(versionRange),
            SuggestionFactory.createLatest(latestCommit)
          );
        }

        return {
          source,
          responseStatus: {
            source: clientResponse.source,
            status: clientResponse.status
          },
          type,
          resolved,
          suggestions,
          gitSpec: npaSpec.saveSpec
        };

      });

  }

  getHeaders() {
    const userHeaders = {};
    if (this.config.github.accessToken && this.config.github.accessToken.length > 0) {
      (<any>userHeaders).authorization = `token ${this.config.github.accessToken}`;
    }
    return Object.assign({}, userHeaders, defaultHeaders);
  }

}