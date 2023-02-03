import { ILogger } from 'domain/logging';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import {
  DocumentFactory,
  TPackageClientResponse,
  PackageSourceType,
  PackageVersionType,
  TPackageRequest,
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

  async fetchPackage(request: TPackageRequest<NuGetClientData>): Promise<TPackageClientResponse> {
    const dotnetSpec = parseVersionSpec(request.package.version);
    return this.fetchPackageRetry(request, dotnetSpec);
  }

  async fetchPackageRetry(
    request: TPackageRequest<NuGetClientData>,
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
          return DocumentFactory.create(
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
    request: TPackageRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};
    const packageUrl = UrlHelpers.ensureEndSlash(url) + `${request.package.name.toLowerCase()}/index.json`;

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
          return DocumentFactory.create(
            PackageSourceType.Registry,
            httpResponse,
            [],
          )
        }

        // no match if null type
        if (dotnetSpec.type === null) {
          return DocumentFactory.createNoMatch(
            source,
            PackageVersionType.Version,
            DocumentFactory.createResponseStatus(httpResponse.source, 404),
            // suggest the latest release if available
            releases.length > 0 ? releases[releases.length - 1] : null,
          )
        }

        const versionRange = dotnetSpec.resolvedVersion;

        const resolved = {
          name: request.package.name,
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