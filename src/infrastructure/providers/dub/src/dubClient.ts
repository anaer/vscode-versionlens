import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageClientSourceType,
  TPackageClientRequest,
  TPackageClientResponse,
  TSemverSpec,
  VersionHelpers
} from 'domain/packages';
import {
  createSuggestions,
  SuggestionFactory,
  SuggestionStatus,
  TPackageSuggestion
} from 'domain/suggestions';
import { DubConfig } from './dubConfig';

export class DubClient implements IPackageClient<null> {

  config: DubConfig;

  jsonClient: IJsonHttpClient;

  logger: ILogger;

  constructor(config: DubConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.jsonClient = client;
    this.logger = logger;
  }

  fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionHelpers.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}${encodeURIComponent(requestedPackage.name)}/info`;

    return this.createRemotePackageDocument(url, request, semverSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageClientSourceType.Registry,
          error
        );

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return ClientResponseFactory.create(
            PackageClientSourceType.Registry,
            error,
            [suggestion]
          )
        }
        return Promise.reject(error);
      });
  }

  createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<null>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const requestedPackage = request.dependency.package;

    const query = {
      minimize: 'true',
    }

    const headers = {};

    return this.jsonClient.request(HttpClientRequestMethods.get, url, query, headers)
      .then((httpResponse): TPackageClientResponse => {
        const packageInfo = httpResponse.data;
        const versionRange = semverSpec.rawVersion;

        const resolved = {
          name: requestedPackage.name,
          version: versionRange,
        };

        const responseStatus = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        const rawVersions = VersionHelpers.extractVersionsFromMap(packageInfo.versions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          rawVersions,
          this.config.prereleaseTagFilter
        );

        // analyse suggestions
        const suggestions = parseSuggestions(
          versionRange,
          releases,
          prereleases
        );

        return {
          source: PackageClientSourceType.Registry,
          responseStatus,
          type: semverSpec.type,
          resolved,
          suggestions,
        };
      });
  }

}

export function parseSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[]
): Array<TPackageSuggestion> {

  const suggestions = createSuggestions(
    versionRange,
    releases,
    prereleases
  );

  // check for ~{name} suggestion if no matches found
  const firstSuggestion = suggestions[0];
  const hasNoMatch = firstSuggestion.name === SuggestionStatus.NoMatch;
  const isTildeVersion = versionRange.charAt(0) === '~';

  if (hasNoMatch && isTildeVersion && releases.length > 0) {
    const latestRelease = releases[releases.length - 1];

    if (latestRelease === versionRange) {
      suggestions[0] = SuggestionFactory.createMatchesLatest(versionRange);
      suggestions.pop();
    } else {
      // suggest
      suggestions[1] = SuggestionFactory.createLatest(latestRelease);
    }

  }

  return suggestions;
}