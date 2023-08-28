import { throwUndefinedOrNull } from '@esm-test/guards';
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
  VersionUtils
} from 'domain/packages';
import {
  SuggestionFactory,
  SuggestionStatus,
  TPackageSuggestion,
  createSuggestions
} from 'domain/suggestions';
import { DubConfig } from './dubConfig';

export class DubClient implements IPackageClient<null> {

  constructor(
    readonly config: DubConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("jsonClient", jsonClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}${encodeURIComponent(requestedPackage.name)}/info`;

    try {
      return await this.createRemotePackageDocument(url, request, semverSpec);
    } catch (error) {
      const errorResponse = error as HttpClientResponse;

      this.logger.debug(
        "Caught exception from %s: %O",
        PackageClientSourceType.Registry,
        errorResponse
      );

      const suggestion = SuggestionFactory.createFromHttpStatus(errorResponse.status);
      if (suggestion != null) {
        return ClientResponseFactory.create(
          PackageClientSourceType.Registry,
          errorResponse,
          [suggestion]
        );
      }

      throw errorResponse;
    }
  }

  async createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<null>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const query = { minimize: 'true' }
    const headers = {};

    // fetch package from api
    const httpResponse = await this.jsonClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    );

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

    const rawVersions = VersionUtils.extractVersionsFromMap(packageInfo.versions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
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