import { throwUndefinedOrNull } from '@esm-test/guards';
import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IHttpClient
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageSourceType,
  SuggestionFactory,
  TPackageClientRequest,
  TPackageClientResponse,
  TSemverSpec,
  VersionUtils,
  createSuggestions
} from 'domain/packages';
import { MavenClientData } from '../definitions/mavenClientData';
import { MavenConfig } from '../mavenConfig';
import { getVersionsFromPackageXml } from '../parser/mavenXmlUtils';

export class MavenClient implements IPackageClient<MavenClientData> {

  constructor(
    readonly config: MavenConfig,
    readonly httpClient: IHttpClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("httpClient", httpClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage(
    request: TPackageClientRequest<MavenClientData>
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;
    const semverSpec = VersionUtils.parseSemver(requestedPackage.version);

    const { repositories } = request.clientData;
    const url = this.config.apiUrl ? this.config.apiUrl : repositories[0].url
    // 只有配置apiUrl时才使用cookie
    const cookie = this.config.apiUrl ? this.config.apiCookie : null

    let [group, artifact] = requestedPackage.name.split(':');
    let search = group.replace(/\./g, "/") + "/" + artifact
    const queryUrl = `${url}${search}/maven-metadata.xml`;
    this.logger.info('queryUrl: %s', queryUrl);

    try {
      return await this.createRemotePackageDocument(queryUrl, cookie, request, semverSpec);
    } catch (error) {
      const errorResponse = error as HttpClientResponse;

      this.logger.debug(
        "Caught exception from %s: %O",
        PackageSourceType.Registry,
        errorResponse
      );

      const suggestion = SuggestionFactory.createFromHttpStatus(errorResponse.status);
      if (suggestion != null) {
        return ClientResponseFactory.create(
          PackageSourceType.Registry,
          errorResponse,
          [suggestion]
        )
      }

      throw errorResponse;
    }
  }

  async createRemotePackageDocument(
    url: string,
    cookie: string,
    request: TPackageClientRequest<MavenClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {
    const query = {};
    const headers = {};

    if (cookie != null) {
      headers['Cookie'] = cookie
    }

    // fetch package from api
    const httpResponse = await this.httpClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    );

    const { data } = httpResponse;
    const source = PackageSourceType.Registry;
    const versionRange = semverSpec.rawVersion;
    const requestedPackage = request.dependency.package;

    const responseStatus = {
      source: httpResponse.source,
      status: httpResponse.status,
    };

    // extract versions form xml
    const rawVersions = getVersionsFromPackageXml(data);

    // extract semver versions only
    const semverVersions = VersionUtils.filterSemverVersions(rawVersions);

    // seperate versions to releases and prereleases
    const { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      semverVersions,
      this.config.prereleaseTagFilter
    );

    const resolved = {
      name: requestedPackage.name,
      version: versionRange,
    };

    // this.logger.info(
    //     "createSuggestions: %s, %s, %s",
    //     versionRange,
    //     releases,
    //     prereleases
    //   );

    // analyse suggestions
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases
    );

    return {
      source,
      responseStatus,
      type: semverSpec.type,
      resolved,
      suggestions,
    };
  }

}