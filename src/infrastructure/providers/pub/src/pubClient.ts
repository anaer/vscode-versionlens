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
  PackageDescriptorType,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageGitDescriptor,
  TPackageHostedDescriptor,
  TPackagePathDescriptor,
  TSemverSpec,
  VersionUtils
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

    // return a directory response if this a path type
    const pathDesc = request.dependency.packageDesc.getType<TPackagePathDescriptor>(
      PackageDescriptorType.path
    );
    if (pathDesc) {
      return ClientResponseFactory.createDirectory(
        requestedPackage.name,
        pathDesc.path
      );
    }

    // return a git response if this a git type
    const gitDesc = request.dependency.packageDesc.getType<TPackageGitDescriptor>(
      PackageDescriptorType.git
    );
    if (gitDesc) {
      return ClientResponseFactory.createGit();
    }

    // parse the version
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);

    // use the hosted entry if it exists
    const hosted = request.dependency.packageDesc.getType<TPackageHostedDescriptor>(
      PackageDescriptorType.hosted
    );

    const url = hosted
      ? `${hosted.hostUrl}/api/documentation/${requestedPackage.name}`
      : `${this.config.apiUrl}/api/documentation/${requestedPackage.name}`;

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

      throw errorResponse;
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

    const rawVersions = VersionUtils.extractVersionsFromMap(packageInfo.versions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
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