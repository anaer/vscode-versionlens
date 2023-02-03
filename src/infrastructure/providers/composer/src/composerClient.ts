import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient,
  JsonClientResponse
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  DocumentFactory,
  IPackageClient,
  PackageSourceType,
  TPackageClientResponse,
  TPackageRequest,
  TSemverSpec,
  VersionHelpers
} from 'domain/packages';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import fs from 'node:fs';
import { ComposerConfig } from './composerConfig';
import { IPackagistApiItem } from './definitions/iPackagistApiItem';

export class ComposerClient implements IPackageClient<null> {

  config: ComposerConfig;

  client: IJsonHttpClient;

  logger: ILogger;

  constructor(
    config: ComposerConfig,
    client: IJsonHttpClient,
    logger: ILogger
  ) {
    this.config = config;
    this.client = client;
    this.logger = logger;
  }

  async fetchPackage<TClientData>(
    request: TPackageRequest<TClientData>
  ): Promise<TPackageClientResponse> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.apiUrl}${request.package.name}.json`;

    return this.createRemotePackageDocument(url, request, semverSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceType.Registry,
          error
        );

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return DocumentFactory.create(
            PackageSourceType.Registry,
            error,
            [suggestion]
          )
        }

        return Promise.reject(error);
      });
  }

  async createRemotePackageDocument<TClientData>(
    url: string,
    request: TPackageRequest<TClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    return this.client.request(HttpClientRequestMethods.get, url, query, headers)
      .then(function (httpResponse: JsonClientResponse): TPackageClientResponse {
        const packageInfo = httpResponse.data.packages[request.package.name];

        const versionRange = semverSpec.rawVersion;

        const resolved = {
          name: request.package.name,
          version: versionRange,
        };

        const responseStatus = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        let rawVersions: string[] = [];

        if (url.indexOf('/p2/') !== -1) {
          packageInfo
            .reverse()
            .forEach(
              (packageObject: IPackagistApiItem) => rawVersions.push(packageObject.version)
            )
        } else {
          rawVersions = Object.keys(packageInfo);
        }

        // extract semver versions only
        const semverVersions = VersionHelpers.filterSemverVersions(rawVersions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          VersionHelpers.filterSemverVersions(semverVersions)
        );

        // analyse suggestions
        const suggestions = createSuggestions(
          versionRange,
          releases,
          prereleases
        );

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

