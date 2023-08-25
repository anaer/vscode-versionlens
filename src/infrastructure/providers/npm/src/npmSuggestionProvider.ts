import { IExpiryCache } from 'domain/caching/iExpiryCache';
import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageDescriptorType,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
  TPackageVersionDescriptor
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { NpmPackageClient } from './clients/npmPackageClient';
import { TNpmClientData } from './definitions/tNpmClientData';
import { NpmConfig } from './npmConfig';
import { createPacoteOptions, npmReplaceVersion, resolveDotFilePath } from './npmUtils';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode
};

export class NpmSuggestionProvider
  extends SuggestionProvider<NpmPackageClient, TNpmClientData>
  implements ISuggestionProvider {

  constructor(client: NpmPackageClient, suggestionCache: IExpiryCache, logger: ILogger) {
    super(client, suggestionCache, logger);
    this.config = client.config;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  config: NpmConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {

    const options: TJsonPackageParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const packageDescriptors = extractPackageDependenciesFromJson(
      packageText,
      options
    );

    const packageDependencies = [];

    for (const packageDesc of packageDescriptors) {

      // handle any pnpm override dependency selectors in the name
      let name = packageDesc.name;
      const atIndex = name.indexOf('@');
      if (atIndex > 0) {
        name = name.slice(0, atIndex);
      }

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const versionType = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              name,
              versionType.version,
              packagePath
            ),
            packageDesc.nameRange,
            versionType.versionRange
          )
        );

        continue;
      }

    }

    return packageDependencies;
  }

  async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<any> {
    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    // path to user .npmrc
    const userConfigPath = resolve(homedir(), ".npmrc");

    // package path takes precedence for .npmrc
    const resolveDotFilePaths = [
      packagePath,
      projectPath
    ];

    // try to resolve project .npmrc files
    const npmRcFilePath = await resolveDotFilePath(".npmrc", resolveDotFilePaths);
    const hasNpmRcFile = npmRcFilePath.length > 0;
    this.logger.debug("Resolved .npmrc is %s", hasNpmRcFile ? npmRcFilePath : false);

    // try to resolve .env files (if .npmrc exists)
    let envFilePath = "";
    if (hasNpmRcFile) {
      envFilePath = await resolveDotFilePath(".env", resolveDotFilePaths);
    }
    const hasEnvFile = envFilePath.length > 0;
    this.logger.debug("Resolved .env is %s", hasEnvFile ? envFilePath : false);

    // return pacote options as client data
    const npmCliOptions = {
      projectPath,
      userConfigPath,
      npmRcFilePath,
      envFilePath,
      hasNpmRcFile,
      hasEnvFile
    };

    return createPacoteOptions(packagePath, npmCliOptions)
  }

}