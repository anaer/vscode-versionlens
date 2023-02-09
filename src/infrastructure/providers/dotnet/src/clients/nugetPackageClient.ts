import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient,
  UrlHelpers
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageClientSourceType,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse,
  VersionHelpers
} from 'domain/packages';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import { DotNetVersionSpec } from '../definitions/dotnet';
import { NuGetClientData } from '../definitions/nuget';
import { DotNetConfig } from '../dotnetConfig';
import { parseVersionSpec } from '../dotnetUtils';

export class NuGetPackageClient implements IPackageClient<NuGetClientData> {

  config: DotNetConfig;

  jsonClient: IJsonHttpClient;

  logger: ILogger;

  constructor(config: DotNetConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.jsonClient = client;
    this.logger = logger;
  }

  fetchPackage(request: TPackageClientRequest<NuGetClientData>): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const dotnetSpec = parseVersionSpec(requestedPackage.version);
    return this.fetchPackageRetry(request, dotnetSpec);
  }

  fetchPackageRetry(
    request: TPackageClientRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageClientResponse> {
    const urls = request.clientData.serviceUrls;
    const autoCompleteUrl = urls[request.attempt];

    return this.createRemotePackageDocument(autoCompleteUrl, request, dotnetSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageClientSourceType.Registry,
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
            PackageClientSourceType.Registry,
            error,
            [suggestion]
          )
        }

        // unexpected
        return Promise.reject(error);
      });

  }

  createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<NuGetClientData>,
    dotnetSpec: DotNetVersionSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};
    const requestedPackage = request.dependency.package;
    const packageUrl = UrlHelpers.ensureEndSlash(url) + `${requestedPackage.name.toLowerCase()}/index.json`;

    return this.jsonClient.request(
      HttpClientRequestMethods.get,
      packageUrl,
      query,
      headers
    )
      .then((httpResponse) => {

        const { data } = httpResponse;

        const source = PackageClientSourceType.Registry;

        const packageInfo = data;

        const responseStatus = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        // sanitize to semver only versions
        const rawVersions = VersionHelpers.filterSemverVersions(packageInfo.versions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          rawVersions,
          this.config.prereleaseTagFilter
        );

        // four segment is not supported
        if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
          return ClientResponseFactory.create(
            PackageClientSourceType.Registry,
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