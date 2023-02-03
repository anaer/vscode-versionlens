import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  DocumentFactory,
  IPackageClient,
  PackageSourceTypes,
  TPackageDocument,
  TPackageRequest,
  TSemverSpec,
  VersionHelpers
} from 'domain/packages';
import {
  createSuggestions,
  SuggestionFactory,
  SuggestionStatus,
  TPackageSuggestion
} from 'domain/suggestions';
import fs from 'node:fs';
import { DubConfig } from './dubConfig';

export class DubClient implements IPackageClient<null> {

  config: DubConfig;

  client: IJsonHttpClient;

  logger: ILogger;

  constructor(config: DubConfig, client: IJsonHttpClient, logger: ILogger) {
    this.config = config;
    this.client = client;
    this.logger = logger;
  }

  async fetchPackage(request: TPackageRequest<null>): Promise<TPackageDocument> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);
    const url = `${this.config.apiUrl}${encodeURIComponent(request.package.name)}/info`;

    return this.createRemotePackageDocument(url, request, semverSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceTypes.Registry,
          error
        );

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return DocumentFactory.create(
            PackageSourceTypes.Registry,
            error,
            [suggestion]
          )
        }
        return Promise.reject(error);
      });
  }

  async createRemotePackageDocument(
    url: string,
    request: TPackageRequest<null>,
    semverSpec: TSemverSpec
  ): Promise<TPackageDocument> {

    const query = {
      minimize: 'true',
    }

    const headers = {};

    return this.client.request(HttpClientRequestMethods.get, url, query, headers)
      .then(function (httpResponse): TPackageDocument {

        const packageInfo = httpResponse.data;

        const versionRange = semverSpec.rawVersion;

        const resolved = {
          name: request.package.name,
          version: versionRange,
        };

        const response = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        const rawVersions = VersionHelpers.extractVersionsFromMap(packageInfo.versions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(rawVersions)

        // analyse suggestions
        const suggestions = parseSuggestions(
          versionRange,
          releases,
          prereleases
        );

        return {
          source: PackageSourceTypes.Registry,
          response,
          type: semverSpec.type,
          resolved,
          suggestions,
        };
      });
  }

}

export function parseSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[]
): Array<TPackageSuggestion> {

  const suggestions = createSuggestions(
    versionRange,
    releases,
    prereleases
  );

  // check for ~{name} suggestion if no matches found
  const firstSuggestion = suggestions[0];
  const hasNoMatch = firstSuggestion.name === SuggestionStatus.NoMatch;
  const isTildeVersion = versionRange.charAt(0) === '~';

  if (hasNoMatch && isTildeVersion && releases.length > 0) {
    const latestRelease = releases[releases.length - 1];

    if (latestRelease === versionRange) {
      suggestions[0] = SuggestionFactory.createMatchesLatest(versionRange);
      suggestions.pop();
    } else {
      // suggest
      suggestions[1] = SuggestionFactory.createLatest(latestRelease);
    }

  }

  return suggestions;
}

export async function readDubSelections(filePath) {

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
      if (selectionsJson.fileVersion != 1) {
        reject(new Error(`Unknown dub.selections.json file version ${selectionsJson.fileVersion}`))
        return;
      }

      resolve(selectionsJson);
    });

  });

}