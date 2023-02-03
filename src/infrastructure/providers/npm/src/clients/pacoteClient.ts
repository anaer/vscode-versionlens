import { AbstractCachedRequest, ClientResponseSource } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  PackageSourceType,
  PackageVersionType,
  TPackageClientResponse,
  TPackageClientRequest,
  VersionHelpers
} from 'domain/packages';
import { createSuggestions } from 'domain/suggestions';
import { homedir } from 'os';
import { resolve } from 'path';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';
import * as NpmUtils from '../npmUtils';

export class PacoteClient extends AbstractCachedRequest<number, TPackageClientResponse> {

  config: NpmConfig;

  logger: ILogger;

  pacote: any;

  NpmCliConfig: any;

  constructor(config: NpmConfig, logger: ILogger) {
    super(config.caching);
    this.config = config;
    this.logger = logger;
    this.pacote = require('pacote');
    this.NpmCliConfig = require('@npmcli/config');
  }

  async fetchPackage(
    request: TPackageClientRequest<null>,
    npaSpec: NpaSpec
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;

    const cacheKey = `${requestedPackage.name}@${requestedPackage.version}_${requestedPackage.path}`;
    if (this.cache.cachingOpts.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      this.logger.debug("Fetching from cache using key: %s", cacheKey);
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);

      cachedResp.data.responseStatus.source = ClientResponseSource.cache;
      return Promise.resolve(cachedResp.data);
    }

    // load the npm config
    const userConfigPath = resolve(homedir(), ".npmrc");
    const npmConfig = new this.NpmCliConfig({
      shorthands: {},
      definitions: {},
      npmPath: requestedPackage.path,
      cwd: requestedPackage.path,
      // ensure user config is parsed by npm
      argv: ['', '', `--userconfig=${userConfigPath}`],
      // setup up a custom env for .env files
      env: NpmUtils.getDotEnv(requestedPackage.path)
    });
    await npmConfig.load();

    // flatten all the options
    const npmOpts = npmConfig.list.reduce(
      (memo, list) => ({ ...memo, ...list }),
      { cwd: requestedPackage.path }
    );

    // fetch the package from npm's pacote
    return this.pacote.packument(npaSpec, npmOpts)
      .then(function (packumentResponse): TPackageClientResponse {

        const { compareLoose } = require("semver");

        const source: PackageSourceType = PackageSourceType.Registry;

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

        // extract raw versions and sort
        const rawVersions = Object.keys(packumentResponse.versions || {}).sort(compareLoose);

        // seperate versions to releases and prereleases
        let { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          rawVersions
        );

        // extract prereleases from dist tags
        const distTags = packumentResponse['dist-tags'] || {};
        const latestTaggedVersion = distTags['latest'];

        // extract releases
        if (latestTaggedVersion) {
          // cap the releases to the latest tagged version
          releases = VersionHelpers.lteFromArray(
            releases,
            latestTaggedVersion
          );
        }

        const responseStatus = {
          source: ClientResponseSource.remote,
          status: 200,
        };

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
              source,
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
          source,
          responseStatus,
          type,
          resolved,
          suggestions,
        };

      }).then(document => {
        this.createCachedResponse(
          cacheKey,
          200,
          document,
          false
        );
        return document;
      }).catch(response => {
        this.createCachedResponse(
          cacheKey,
          response.code,
          response.message,
          true
        );
        return Promise.reject(
          NpmUtils.convertNpmErrorToResponse(
            response,
            ClientResponseSource.remote
          )
        );
      });

  }

}