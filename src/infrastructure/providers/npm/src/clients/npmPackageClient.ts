import { throwUndefinedOrNull } from '@esm-test/guards';
import { ClientResponseSource } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageSourceType,
  SuggestionFactory,
  TPackageClientRequest,
  TPackageClientResponse,
  TPackageSuggestion
} from 'domain/packages';
import npa from 'npm-package-arg';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';
import * as NpmUtils from '../npmUtils';
import { GitHubClient } from './githubClient';
import { PacoteClient } from './pacoteClient';

export class NpmPackageClient implements IPackageClient<null> {

  constructor(
    readonly config: NpmConfig,
    readonly pacoteClient: PacoteClient,
    readonly githubClient: GitHubClient,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("pacoteClient", pacoteClient);
    throwUndefinedOrNull("githubClient", githubClient);
    throwUndefinedOrNull("logger", logger);
  }

  async fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    let source: PackageSourceType;

    try {
      const requestedPackage = request.dependency.package;

      const npaSpec = npa.resolve(
        requestedPackage.name,
        requestedPackage.version,
        requestedPackage.path
      ) as NpaSpec;

      switch (npaSpec.type) {
        case NpaTypes.Directory:
          source = PackageSourceType.Directory
          break;
        case NpaTypes.File:
          source = PackageSourceType.File
          break;
        case NpaTypes.Git:
          source = PackageSourceType.Github
          break;
        case NpaTypes.Version:
        case NpaTypes.Range:
        case NpaTypes.Remote:
        case NpaTypes.Alias:
        case NpaTypes.Tag:
          source = PackageSourceType.Registry
          break;
      }

      // return if directory or file document
      if (source === PackageSourceType.Directory || source === PackageSourceType.File) {
        return ClientResponseFactory.createDirectoryFromFileProtocol(requestedPackage);
      }

      if (source === PackageSourceType.Github) {

        if (!npaSpec.hosted) {
          // could not resolve
          throw {
            status: 'EUNSUPPORTEDPROTOCOL',
            data: 'Git url could not be resolved',
            source: ClientResponseSource.local
          };
        }

        if (!npaSpec.gitCommittish && npaSpec.hosted.default !== 'shortcut') {
          return ClientResponseFactory.createGit();
        }

        // resolve tags, committishes
        return await this.githubClient.fetchGithub(npaSpec);
      }

      // otherwise return registry result
      return await this.pacoteClient.fetchPackage(request, npaSpec);

    } catch (response) {
      this.logger.debug("Caught exception from %s: %O", source, response);

      if (!response.data) {
        response = NpmUtils.convertNpmErrorToResponse(
          response,
          ClientResponseSource.remote
        );
      }

      const status = response.status &&
        !Number.isInteger(response.status) &&
        response.status.startsWith('E') ?
        response.status.substr(1) :
        response.status;

      let suggestions: Array<TPackageSuggestion>;

      if (status == 'CONNREFUSED')
        suggestions = [SuggestionFactory.createConnectionRefusedStatus()];
      else if (status == 'CONNRESET')
        suggestions = [SuggestionFactory.createConnectionResetStatus()];
      else if (status == 'UNSUPPORTEDPROTOCOL' || response.data == 'Not implemented yet')
        suggestions = [SuggestionFactory.createNotSupportedStatus()];
      else if (status == 'INVALIDTAGNAME' || response.data.includes('Invalid comparator:'))
        suggestions = [
          SuggestionFactory.createInvalidStatus(''),
          SuggestionFactory.createLatestUpdateable()
        ];
      else if (status == 'INVALIDPACKAGENAME')
        suggestions = [
          SuggestionFactory.createInvalidStatus('')
        ];
      else if (status == 128)
        suggestions = [SuggestionFactory.createNotFoundStatus()]
      else
        suggestions = [SuggestionFactory.createFromHttpStatus(status)];

      if (suggestions === null) throw response;

      return ClientResponseFactory.create(
        source,
        ClientResponseFactory.createResponseStatus(response.source, response.status),
        suggestions
      );

    };

  }

}