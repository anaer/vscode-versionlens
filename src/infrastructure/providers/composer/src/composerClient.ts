import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient,
  JsonClientResponse
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
import fs from 'node:fs';
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

  fetchPackage<TClientData>(
    request: TPackageClientRequest<TClientData>
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionHelpers.parseSemver(requestedPackage.version);
    const url = `${this.config.apiUrl}${requestedPackage.name}.json`;

    return this.createRemotePackageDocument(url, request, semverSpec)
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

  createRemotePackageDocument<TClientData>(
    url: string,
    request: TPackageClientRequest<TClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    return this.jsonClient.request(HttpClientRequestMethods.get, url, query, headers)
      .then(function (httpResponse: JsonClientResponse): TPackageClientResponse {
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
        const semverVersions = VersionHelpers.filterSemverVersions(rawVersions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          semverVersions
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
      });
  }
}

export function readComposerSelections(filePath) {

  return new Promise(function (resolve, reject) {
    if (fs.existsSync(filePath) === false) {
      reject(null);
      return;
    }

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err)
        return;
      }

      const selectionsJson = JSON.parse(data.toString());

      resolve(selectionsJson);
    });

  });

}

