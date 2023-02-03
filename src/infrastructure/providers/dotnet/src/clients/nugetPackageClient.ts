import { ILogger } from 'domain/logging';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import {
  ClientResponseFactory,
  TPackageClientResponse,
  PackageSourceType,
  PackageVersionType,
  TPackageClientRequest,
  VersionHelpers,
  IPackageClient
} from 'domain/packages';

import {
  HttpClientResponse,
  HttpClientRequestMethods,
  UrlHelpers,
  IJsonHttpClient,
} from 'domain/clients';

import { NuGetClientData } from '../definitions/nuget';
import { DotNetVersionSpec } from '../definitions/dotnet';
import { parseVersionSpec } from '../dotnetUtils';
import { DotNetConfig } from '../dotnetConfig';

export class NuGetPackageClient implements IPackageClient<NuGetClientData> {

  config: DotNetConfig;

  client: IJsonHttpClient;

  logger: ILogger;

  constructor(config: DotNetConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.client = client;
    this.logger = logger;
  }

  async fetchPackage(request: TPackageClientRequest<NuGetClientData>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const dotnetSpec = parseVersionSpec(requestedPackage.version);
    return this.fetchPackageRetry(request, dotnetSpec);
  }

  async fetchPackageRetry(
    request: TPackageClientRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageClientResponse> {
    const urls = request.clientData.serviceUrls;
    const autoCompleteUrl = urls[request.attempt];

    return this.createRemotePackageDocument(autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceType.Registry,
          error
        );

        // increase the attempt number
        request.attempt++;

        // only retry if 404 and we have more urls to try
        if (error.status === 404 && request.attempt < urls.length) {
          // retry
          return this.fetchPackageRetry(request, dotnetSpec)
        }

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return ClientResponseFactory.create(
            PackageSourceType.Registry,
            error,
            [suggestion]
          )
        }

        // unexpected
        return Promise.reject(error);
      });

  }

  async createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};
    const requestedPackage = request.dependency.package;
    const packageUrl = UrlHelpers.ensureEndSlash(url) + `${requestedPackage.name.toLowerCase()}/index.json`;

    return this.client.request(
      HttpClientRequestMethods.get,
      packageUrl,
      query,
      headers
    )
      .then(function (httpResponse) {

        const { data } = httpResponse;

        const source = PackageSourceType.Registry;

        const packageInfo = data;

        const responseStatus = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        // sanitize to semver only versions
        const rawVersions = VersionHelpers.filterSemverVersions(packageInfo.versions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(rawVersions)

        // four segment is not supported
        if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
          return ClientResponseFactory.create(
            PackageSourceType.Registry,
            httpResponse,
            [],
          )
        }

        // no match if null type
        if (dotnetSpec.type === null) {
          return ClientResponseFactory.createNoMatch(
            source,
            PackageVersionType.Version,
            ClientResponseFactory.createResponseStatus(httpResponse.source, 404),
            // suggest the latest release if available
            releases.length > 0 ? releases[releases.length - 1] : null,
          )
        }

        const versionRange = dotnetSpec.resolvedVersion;

        const resolved = {
          name: requestedPackage.name,
          version: versionRange,
        };

        // analyse suggestions
        const suggestions = createSuggestions(
          versionRange,
          releases,
          prereleases
        );

        return {
          source,
          responseStatus,
          type: dotnetSpec.type,
          resolved,
          suggestions,
        };
      });
  }

}