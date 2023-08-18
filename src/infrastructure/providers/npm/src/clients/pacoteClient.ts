import { AbstractCachedRequest, ClientResponse } from 'domain/clients';
import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  PackageClientSourceType,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageResource,
  VersionUtils
} from 'domain/packages';
import { createSuggestions } from 'domain/suggestions';
import semver from 'semver';
import { TNpmClientData } from '../definitions/tNpmClientData';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';

export class PacoteClient extends AbstractCachedRequest<number, TPackageClientResponse> {

  constructor(pacote: any, config: NpmConfig, logger: ILogger) {
    super(config.caching);
    this.pacote = pacote;
    this.config = config;
    this.logger = logger;
  }

  config: NpmConfig;

  logger: ILogger;

  pacote: any;

  async fetchPackage(
    request: TPackageClientRequest<TNpmClientData>,
    npaSpec: NpaSpec
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;

    // fetch the package from npm's pacote
    const response = await this.request(requestedPackage, npaSpec, request.clientData);

    const { compareLoose } = semver;

    const type: PackageVersionType = <any>npaSpec.type;

    let versionRange: string = (type === PackageVersionType.Alias) ?
      npaSpec.subSpec.rawSpec :
      npaSpec.rawSpec;

    const resolved = {
      name: (type === PackageVersionType.Alias) ?
        npaSpec.subSpec.name :
        npaSpec.name,
      version: versionRange,
    };

    const responseStatus = {
      source: response.source,
      status: response.status,
    };

    const packumentResponse = response.data;

    // extract raw versions and sort
    const rawVersions = Object.keys(packumentResponse.versions || {}).sort(compareLoose);

    // seperate versions to releases and prereleases
    let { releases, prereleases } = VersionUtils.splitReleasesFromArray(
      rawVersions,
      this.config.prereleaseTagFilter
    );

    // extract prereleases from dist tags
    const distTags = packumentResponse['dist-tags'] || {};
    const latestTaggedVersion = distTags['latest'];

    // extract releases
    if (latestTaggedVersion) {
      // cap the releases to the latest tagged version
      releases = VersionUtils.lteFromArray(
        releases,
        latestTaggedVersion
      );
    }

    // use 'latest' tagged version from author?
    const suggestLatestVersion = latestTaggedVersion || (
      releases.length > 0 ?
        // suggest latest release?
        releases[releases.length - 1] :
        // no suggestion
        null
    );

    if (npaSpec.type === NpaTypes.Tag) {

      // get the tagged version. eg latest|next
      versionRange = distTags[requestedPackage.version];
      if (!versionRange) {

        // No match
        return ClientResponseFactory.createNoMatch(
          PackageClientSourceType.Registry,
          type,
          responseStatus,
          suggestLatestVersion
        );

      }

    }

    // analyse suggestions
    const suggestions = createSuggestions(
      versionRange,
      releases,
      prereleases,
      suggestLatestVersion
    );

    return {
      source: PackageClientSourceType.Registry,
      responseStatus,
      type,
      resolved,
      suggestions,
    };

  }

  async request(
    requestedPackage: TPackageResource,
    npaSpec: NpaSpec,
    options: KeyDictionary<any>
  ): Promise<ClientResponse<number, any>> {

    const cacheKey = this.getCacheKey(requestedPackage);
    if (this.cache.cachingOpts.duration > 0
      && this.cache.hasExpired(cacheKey) === false) {
      this.logger.debug("Fetching from cache using key: %s", cacheKey);
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) throw cachedResp;
      return cachedResp;
    }

    const before = new Date();

    try {
      // fetch the package from npm's pacote
      const packumentResponse = await this.pacote.packument(
        npaSpec,
        {
          before,
          ...options
        }
      );

      return this.createCachedResponse(
        cacheKey,
        200,
        packumentResponse,
        false
      );

    } catch (error) {
      const result = this.createCachedResponse(
        cacheKey,
        error.code,
        error.message,
        true
      );

      throw result;
    }

  }

  getCacheKey(pkg: TPackageResource) {
    return `${pkg.name}@${pkg.version}`;
  }

}