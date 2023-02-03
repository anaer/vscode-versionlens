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
  TPackageClientResponse,
  TPackageClientRequest,
  TSemverSpec,
  VersionHelpers
} from 'domain/packages';
import { createSuggestions, SuggestionFactory } from 'domain/suggestions';
import xmldoc from 'xmldoc';
import { MavenClientData } from '../definitions/mavenClientData';
import { MavenConfig } from '../mavenConfig';

export class MavenClient implements IPackageClient<MavenClientData> {

  config: MavenConfig;

  httpClient: IHttpClient;

  logger: ILogger;

  constructor(config: MavenConfig, httpClient: IHttpClient, logger: ILogger) {
    this.config = config;
    this.httpClient = httpClient;
    this.logger = logger;
  }
  async fetchPackage(request: TPackageClientRequest<MavenClientData>): Promise<TPackageClientResponse> {
    const semverSpec = VersionHelpers.parseSemver(request.package.version);

    const { repositories } = request.clientData;
    const url = repositories[0].url
    let [group, artifact] = request.package.name.split(':');
    let search = group.replace(/\./g, "/") + "/" + artifact
    const queryUrl = `${url}${search}/maven-metadata.xml`;

    return this.createRemotePackageDocument(queryUrl, request, semverSpec)
      .catch((error: HttpClientResponse) => {

        this.logger.debug(
          "Caught exception from %s: %O",
          PackageSourceType.Registry,
          error
        );

        const suggestion = SuggestionFactory.createFromHttpStatus(error.status);
        if (suggestion != null) {
          return ClientResponseFactory.create(
            PackageSourceType.Registry,
            error,
            [suggestion]
          )
        }
        return Promise.reject(error);
      });
  }

  async createRemotePackageDocument(
    url: string,
    request: TPackageClientRequest<MavenClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageClientResponse> {

    const query = {};
    const headers = {};

    return this.httpClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    )
      .then(function (httpResponse): TPackageClientResponse {

        const { data } = httpResponse;

        const source = PackageSourceType.Registry;

        const versionRange = semverSpec.rawVersion;

        const responseStatus = {
          source: httpResponse.source,
          status: httpResponse.status,
        };

        // extract versions form xml
        const rawVersions = getVersionsFromPackageXml(data);

        // extract semver versions only
        const semverVersions = VersionHelpers.filterSemverVersions(rawVersions);

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          semverVersions
        );

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
          type: semverSpec.type,
          resolved,
          suggestions,
        };
      });
  }

}

function getVersionsFromPackageXml(packageXml: string): Array<string> {
  let xmlRootNode = new xmldoc.XmlDocument(packageXml);
  let xmlVersioningNode = xmlRootNode.childNamed("versioning");
  let xmlVersionsList = xmlVersioningNode.childNamed("versions").childrenNamed("version");
  let versions = [];

  xmlVersionsList.forEach(xmlVersionNode => {
    versions.push(xmlVersionNode.val);
  })

  return versions
}