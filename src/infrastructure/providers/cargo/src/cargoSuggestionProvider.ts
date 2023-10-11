import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
  PackageDependency, PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor,
  TTomlPackageParserOptions,
  createPackageResource,
  parsePackagesToml
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/providers';
import { CargoConfig } from './cargoConfig';
import { CratesClient } from './cratesClient';

export class CargoSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'cargo';

  constructor(
    readonly client: CratesClient,
    readonly config: CargoConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {

    const options: TTomlPackageParserOptions = {
      includePropNames: this.config.dependencyProperties
    };

    const parsedPackages = parsePackagesToml(packageText, options);

    const packageDependencies = parsedPackages
      .filter(x => x.hasType(PackageDescriptorType.version))
      .map(
        packageDesc => {
          const nameDesc = packageDesc.getType<TPackageNameDescriptor>(
            PackageDescriptorType.name
          );

          const versionDesc = packageDesc.getType<TPackageVersionDescriptor>(
            PackageDescriptorType.version
          );

          return new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionDesc.version,
              packagePath
            ),
            nameDesc.nameRange,
            versionDesc.versionRange,
            packageDesc
          )
        }
      );

    return packageDependencies;
  }

}