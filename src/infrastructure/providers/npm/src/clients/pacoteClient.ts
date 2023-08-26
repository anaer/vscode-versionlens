import { throwNull, throwUndefined } from '@esm-test/guards';
import { ClientResponse, ClientResponseSource } from 'domain/clients';
import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  PackageClientSourceType,
  PackageVersionType,
  TPackageClientRequest,
  TPackageClientResponse,
  VersionUtils
} from 'domain/packages';
import { createSuggestions } from 'domain/suggestions';
import semver from 'semver';
import { TNpmClientData } from '../definitions/tNpmClientData';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';

export class PacoteClient {

  constructor(
    readonly pacote: any,
    readonly config: NpmConfig,
    readonly logger: ILogger
  ) {
    throwUndefined("pacote", pacote);
    throwNull("pacote", pacote);

    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  async fetchPackage(
    request: TPackageClientRequest<TNpmClientData>,
    npaSpec: NpaSpec
  ): Promise<TPackageClientResponse> {
    const requestedPackage = request.dependency.package;

    // fetch the package from npm's pacote
    const response = await this.request(npaSpec, request.clientData);

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
    npaSpec: NpaSpec,
    options: KeyDictionary<any>
  ): Promise<ClientResponse<number, any>> {
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

      return <ClientResponse<number, TPackageClientResponse>>{
        source: ClientResponseSource.remote,
        status: 200,
        data: packumentResponse,
        rejected: false
      };

    } catch (error) {
      const result = <ClientResponse<number, TPackageClientResponse>>{
        source: ClientResponseSource.remote,
        status: error.code,
        data: error.message,
        rejected: true
      };

      throw result;
    }

  }

}