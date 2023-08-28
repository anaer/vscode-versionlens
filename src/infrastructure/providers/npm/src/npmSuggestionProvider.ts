import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  PackageCache,
  PackageDependency,
  PackageDescriptorType,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
  TPackageNameDescriptor,
  TPackageVersionDescriptor,
  createPackageResource,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson
} from 'domain/packages';
import {
  ISuggestionProvider,
  SuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { NpmPackageClient } from './clients/npmPackageClient';
import { TNpmClientData } from './definitions/tNpmClientData';
import { NpmConfig } from './npmConfig';
import { createPacoteOptions, npmReplaceVersion, resolveDotFilePath } from './npmUtils';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  [PackageDescriptorType.version]: createVersionDescFromJsonNode
};

export class NpmSuggestionProvider
  extends SuggestionProvider<TNpmClientData>
  implements ISuggestionProvider {

  constructor(client: NpmPackageClient, packageCache: PackageCache, logger: ILogger) {
    super(client, packageCache, logger);
    this.config = client.config;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  config: NpmConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {

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

      const nameDesc = packageDesc.getType<TPackageNameDescriptor>(
        PackageDescriptorType.name
      );

      // handle any pnpm override dependency selectors in the name
      let name = nameDesc.name;
      const atIndex = name.indexOf('@');
      if (atIndex > 0) {
        name = name.slice(0, atIndex);
      }

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const versionDesc = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              name,
              versionDesc.version,
              packagePath
            ),
            nameDesc.nameRange,
            versionDesc.versionRange,
            packageDesc
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