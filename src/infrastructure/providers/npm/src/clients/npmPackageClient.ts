import { throwNull, throwUndefined } from '@esm-test/guards';
import { ClientResponseSource } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageClientSourceType,
  TPackageClientRequest,
  TPackageClientResponse
} from 'domain/packages';
import { SuggestionFactory, TPackageSuggestion } from 'domain/suggestions';
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
    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("pacoteClient", pacoteClient);
    throwNull("pacoteClient", pacoteClient);

    throwUndefined("githubClient", githubClient);
    throwNull("githubClient", githubClient);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    let source: PackageClientSourceType;
    const requestedPackage = request.dependency.package;

    return new Promise<TPackageClientResponse>((resolve, reject) => {
      // try parse the package
      let npaSpec: NpaSpec;
      try {
        npaSpec = npa.resolve(
          requestedPackage.name,
          requestedPackage.version,
          requestedPackage.path
        ) as NpaSpec;
      }
      catch (error) {
        return reject(
          NpmUtils.convertNpmErrorToResponse(error, ClientResponseSource.local)
        );
      }

      switch (npaSpec.type) {
        case NpaTypes.Directory:
          source = PackageClientSourceType.Directory
          break;
        case NpaTypes.File:
          source = PackageClientSourceType.File
          break;
        case NpaTypes.Git:
          source = PackageClientSourceType.Github
          break;
        case NpaTypes.Version:
        case NpaTypes.Range:
        case NpaTypes.Remote:
        case NpaTypes.Alias:
        case NpaTypes.Tag:
          source = PackageClientSourceType.Registry
          break;
      }

      // return if directory or file document
      if (source === PackageClientSourceType.Directory || source === PackageClientSourceType.File) {
        return resolve(ClientResponseFactory.createDirectoryFromFileProtocol(requestedPackage));
      }

      if (source === PackageClientSourceType.Github) {

        if (!npaSpec.hosted) {
          // could not resolve
          return reject({
            status: 'EUNSUPPORTEDPROTOCOL',
            data: 'Git url could not be resolved',
            source: ClientResponseSource.local
          });
        }

        if (!npaSpec.gitCommittish && npaSpec.hosted.default !== 'shortcut') {
          return resolve(ClientResponseFactory.createGit());
        }

        // resolve tags, committishes
        return resolve(this.githubClient.fetchGithub(npaSpec));
      }

      // otherwise return registry result
      return resolve(this.pacoteClient.fetchPackage(request, npaSpec));
    }).catch(response => {
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
        suggestions = [SuggestionFactory.createConnectionRefused()];
      else if (status == 'CONNRESET')
        suggestions = [SuggestionFactory.createConnectionReset()];
      else if (status == 'UNSUPPORTEDPROTOCOL' || response.data == 'Not implemented yet')
        suggestions = [SuggestionFactory.createNotSupported()];
      else if (status == 'INVALIDTAGNAME' || response.data.includes('Invalid comparator:'))
        suggestions = [
          SuggestionFactory.createInvalid(''),
          SuggestionFactory.createLatest()
        ];
      else if (status == 'INVALIDPACKAGENAME')
        suggestions = [
          SuggestionFactory.createInvalid('')
        ];
      else if (status == 128)
        suggestions = [SuggestionFactory.createNotFound()]
      else
        suggestions = [SuggestionFactory.createFromHttpStatus(status)];

      if (suggestions === null) return Promise.reject(response);

      return ClientResponseFactory.create(
        source,
        ClientResponseFactory.createResponseStatus(response.source, response.status),
        suggestions
      );

    });

  }

}
