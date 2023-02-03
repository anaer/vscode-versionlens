import { ClientResponseSource } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  ClientResponseFactory,
  IPackageClient,
  PackageSourceType,
  PackageVersionType,
  TPackageClientResponse,
  TPackageClientRequest
} from 'domain/packages';
import { SuggestionFactory, TPackageSuggestion } from 'domain/suggestions';
import npa from 'npm-package-arg';
import * as PackageFactory from '../factories/packageFactory';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import { NpmConfig } from '../npmConfig';
import * as NpmUtils from '../npmUtils';
import { GitHubClient } from './githubClient';
import { PacoteClient } from './pacoteClient';

export class NpmPackageClient implements IPackageClient<null> {

  logger: ILogger;

  config: NpmConfig;

  pacoteClient: PacoteClient;

  githubClient: GitHubClient;

  constructor(
    config: NpmConfig,
    pacoteClient: PacoteClient,
    githubClient: GitHubClient,
    logger: ILogger
  ) {
    this.config = config;

    this.pacoteClient = pacoteClient;
    this.githubClient = githubClient;
    this.logger = logger;
  }

  async fetchPackage(request: TPackageClientRequest<null>): Promise<TPackageClientResponse> {
    let source: PackageSourceType;
    const requestedPackage = request.dependency.package;

    return new Promise<TPackageClientResponse>((resolve, reject) => {
      let npaSpec: NpaSpec;

      // try parse the package
      try {
        npaSpec = npa.resolve(
          requestedPackage.name,
          requestedPackage.version,
          requestedPackage.path
        );
      }
      catch (error) {
        return reject(
          NpmUtils.convertNpmErrorToResponse(error, ClientResponseSource.local)
        );
      }

      // return if directory or file document
      if (npaSpec.type === NpaTypes.Directory || npaSpec.type === NpaTypes.File) {
        source = PackageSourceType.Directory;
        return resolve(
          PackageFactory.createDirectory(
            requestedPackage,
            ClientResponseFactory.createResponseStatus(ClientResponseSource.local, 200),
            npaSpec,
          )
        );
      }

      if (npaSpec.type === NpaTypes.Git) {

        source = PackageSourceType.Git;

        if (!npaSpec.hosted) {
          // could not resolve
          return reject({
            status: 'EUNSUPPORTEDPROTOCOL',
            data: 'Git url could not be resolved',
            source: ClientResponseSource.local
          });
        }

        if (!npaSpec.gitCommittish && npaSpec.hosted.default !== 'shortcut') {
          return resolve(
            ClientResponseFactory.createFixed(
              PackageSourceType.Git,
              ClientResponseFactory.createResponseStatus(ClientResponseSource.local, 0),
              PackageVersionType.Committish,
              'git repository'
            )
          );
        }

        // resolve tags, committishes
        source = PackageSourceType.Github;
        return resolve(this.githubClient.fetchGithub(npaSpec));
      }

      // otherwise return registry result
      source = PackageSourceType.Registry;
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
