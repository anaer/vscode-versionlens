import { ILogger } from 'domain/logging';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';

import {
  TPackageClientRequest,
  ClientResponseFactory,
  TPackageClientResponse,
  PackageSourceType,
  VersionHelpers,
  TSemverSpec,
  IPackageClient,
} from 'domain/packages';

import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient
} from 'domain/clients';

import { PubConfig } from './pubConfig';

export class PubClient implements IPackageClient<null> {

  config: PubConfig;

  client: IJsonHttpClient;

  logger: ILogger;

  constructor(config: PubConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.client = client;
    this.logger = logger;
  }

  async fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionHelpers.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}api/documentation/${requestedPackage.name}`;

    return this.createRemotePackageDocument(url, requestedPackage.name, semverSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceType.Registry,
          error
        );

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return ClientResponseFactory.create(
            PackageSourceType.Registry,
            error,
            [suggestion]
          )
        }
        return Promise.reject(error);
      });
  }

  async createRemotePackageDocument(
    url: string,
    packageName: string,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    return this.client.request(HttpClientRequestMethods.get, url, query, headers)
      .then(function (httpResponse): TPackageClientResponse {

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
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(rawVersions)

        // analyse suggestions
        const suggestions = createSuggestions(
          versionRange,
          releases,
          prereleases
        );

        // return PackageDocument
        return {
          source: PackageSourceType.Registry,
          responseStatus,
          type: semverSpec.type,
          resolved,
          suggestions,
        };

      });
  }

}