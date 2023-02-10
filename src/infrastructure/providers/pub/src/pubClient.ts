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
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import { PubConfig } from './pubConfig';

export class PubClient implements IPackageClient<null> {

  constructor(config: PubConfig, jsonClient: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.jsonClient = jsonClient;
    this.logger = logger;
  }

  config: PubConfig;

  jsonClient: IJsonHttpClient;

  logger: ILogger;

  async fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionHelpers.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}api/documentation/${requestedPackage.name}`;

    try {
      return await this.createRemotePackageDocument(
        url,
        requestedPackage.name,
        semverSpec
      );
    }
    catch (error) {
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

      return Promise.reject(errorResponse);
    }
  }

  async createRemotePackageDocument(
    url: string,
    packageName: string,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    const httpResponse = await this.jsonClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    );

    const packageInfo = httpResponse.data;

    const versionRange = semverSpec.rawVersion;

    const resolved = {
      name: packageName,
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
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases
    );

    // return PackageDocument
    return {
      source: PackageClientSourceType.Registry,
      responseStatus,
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }

}