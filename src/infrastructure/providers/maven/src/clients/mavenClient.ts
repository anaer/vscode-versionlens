import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IHttpClient
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
  async fetchPackage(request: TPackageRequest<MavenClientData>): Promise<TPackageDocument> {
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
    request: TPackageRequest<MavenClientData>,
    semverSpec: TSemverSpec
  ): Promise<TPackageDocument> {

    const query = {};
    const headers = {};

    return this.httpClient.request(
      HttpClientRequestMethods.get,
      url,
      query,
      headers
    )
      .then(function (httpResponse): TPackageDocument {

        const { data } = httpResponse;

        const source = PackageSourceTypes.Registry;

        const versionRange = semverSpec.rawVersion;

        const response = {
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
          response,
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