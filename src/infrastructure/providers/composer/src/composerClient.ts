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
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import { ComposerConfig } from './composerConfig';
import { IPackagistApiItem } from './definitions/iPackagistApiItem';

export class ComposerClient implements IPackageClient<null> {

  config: ComposerConfig;

  jsonClient: IJsonHttpClient;

  logger: ILogger;

  constructor(
    config: ComposerConfig,
    jsonClient: IJsonHttpClient,
    logger: ILogger
  ) {
    this.config = config;
    this.jsonClient = jsonClient;
    this.logger = logger;
  }

  clearCache() {
    this.jsonClient.clearCache();
  }

  async fetchPackage<TClientData>(
    request: TPackageClientRequest<TClientData>
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}${requestedPackage.name}.json`;

    try {
      return await this.createRemotePackageDocument(url, request, semverSpec)
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
        )
      }

      throw errorResponse;
    }
  }

  async createRemotePackageDocument<TClientData>(
    url: string,
    request: TPackageClientRequest<TClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    // fetch package from api
    const httpResponse = await this.jsonClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    );

    const requestPackage = request.dependency.package;
    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: requestPackage.name,
      version: versionRange,
    };

    const responseStatus = {
      source: httpResponse.source,
      status: httpResponse.status,
    };

    const responseVersions: IPackagistApiItem[] = httpResponse.data.packages[requestPackage.name];

    let rawVersions: string[] = [];
    if (url.indexOf('/p2/') !== -1) {
      rawVersions = responseVersions
        .reverse()
        .map((p: IPackagistApiItem) => p.version);
    } else {
      rawVersions = Object.keys(responseVersions);
    }

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(rawVersions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      semverVersions,
      this.config.prereleaseTagFilter
    );

    // analyse suggestions
    const suggestions = createSuggestions(
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