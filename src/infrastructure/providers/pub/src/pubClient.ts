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

  config: PubConfig;

  jsonClient: IJsonHttpClient;

  logger: ILogger;

  constructor(config: PubConfig, jsonClient: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.jsonClient = jsonClient;
    this.logger = logger;
  }

  fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionHelpers.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}api/documentation/${requestedPackage.name}`;

    return this.createRemotePackageDocument(url, requestedPackage.name, semverSpec)
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
    packageName: string,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    return this.jsonClient.request(HttpClientRequestMethods.get, url, query, headers)
      .then((httpResponse): TPackageClientResponse => {

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

      });
  }

}