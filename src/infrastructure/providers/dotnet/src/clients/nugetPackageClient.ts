import { ILogger } from 'domain/logging';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import {
  DocumentFactory,
  TPackageDocument,
  PackageSourceTypes,
  PackageVersionTypes,
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

  async fetchPackage(request: TPackageRequest<NuGetClientData>): Promise<TPackageDocument> {
    const dotnetSpec = parseVersionSpec(request.package.version);
    return this.fetchPackageRetry(request, dotnetSpec);
  }

  async fetchPackageRetry(
    request: TPackageRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageDocument> {
    const urls = request.clientData.serviceUrls;
    const autoCompleteUrl = urls[request.attempt];

    return this.createRemotePackageDocument(autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceTypes.Registry,
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
            PackageSourceTypes.Registry,
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
  ): Promise<TPackageDocument> {

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

        const source = PackageSourceTypes.Registry;

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
            PackageSourceTypes.Registry,
            httpResponse,
            [],
          )
        }

        // no match if null type
        if (dotnetSpec.type === null) {
          return DocumentFactory.createNoMatch(
            source,
            PackageVersionTypes.Version,
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