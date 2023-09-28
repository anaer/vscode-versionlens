import { throwUndefinedOrNull } from '@esm-test/guards';
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
  PackageSourceType,
  PackageVersionType,
  SuggestionFactory,
  TPackageClientRequest,
  TPackageClientResponse,
  VersionUtils,
  createSuggestions
} from 'domain/packages';
import { NuGetClientData } from '../definitions/nuget';
import { DotNetConfig } from '../dotnetConfig';
import { parseVersionSpec } from '../utils/parseVersionSpec';

export class NuGetPackageClient implements IPackageClient<NuGetClientData> {

  constructor(
    readonly config: DotNetConfig,
    readonly jsonClient: IJsonHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("jsonClient", jsonClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage(
    request: TPackageClientRequest<NuGetClientData>
  ): Promise<TPackageClientResponse> {
    const urls = request.clientData.serviceUrls;
    const autoCompleteUrl = urls[request.attempt];

    try {
      return await this.createRemotePackageDocument(autoCompleteUrl, request);
    }
    catch (error) {
      const errorResponse = error as HttpClientResponse;

      this.logger.debug(
        "request failed for '%s' from '%s': %O",
        request.dependency.package.name,
        autoCompleteUrl,
        errorResponse
      );

      // increase the attempt number
      request.attempt++;

      // only retry if 404 and we have more urls to try
      if (errorResponse.status === 404 && request.attempt < urls.length) {
        this.logger.debug(
          "attempting to fetch '%s' from '%s'",
          request.dependency.package.name,
          urls[request.attempt]
        );
        return this.fetchPackage(request);
      }

      // attempt to create a suggestion from the http status
      const suggestion = SuggestionFactory.createFromHttpStatus(errorResponse.status);
      if (suggestion != null) {
        return ClientResponseFactory.create(
          PackageSourceType.Registry,
          errorResponse,
          [suggestion]
        );
      }

      // unexpected
      return Promise.reject(errorResponse);
    };
  }

  async createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<NuGetClientData>
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};
    const requestedPackage = request.dependency.package;
    const packageUrl = UrlHelpers.ensureEndSlash(url)
      + `${requestedPackage.name.toLowerCase()}/index.json`;

    const httpResponse = await this.jsonClient.request(
      HttpClientRequestMethods.get,
      packageUrl,
      query,
      headers
    );

    const { data } = httpResponse;

    const source = PackageSourceType.Registry;

    const packageInfo = data;

    const responseStatus = {
      source: httpResponse.source,
      status: httpResponse.status,
    };

    // parse nuget range expressions
    const dotnetSpec = parseVersionSpec(requestedPackage.version);

    // four segment is not supported
    if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
      return ClientResponseFactory.create(
        PackageSourceType.Registry,
        httpResponse,
        [],
      );
    }

    // sanitize to semver only versions
    const rawVersions = VersionUtils.filterSemverVersions(packageInfo.versions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      rawVersions,
      this.config.prereleaseTagFilter
    );

    // return no match if null type
    if (dotnetSpec.type === null) {
      return ClientResponseFactory.createNoMatch(
        source,
        PackageVersionType.Version,
        ClientResponseFactory.createResponseStatus(httpResponse.source, 404),
        // suggest the latest release if available
        releases.length > 0 ? releases[releases.length - 1] : null,
      );
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
  }

}