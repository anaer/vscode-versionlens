import { KeyDictionary } from "domain/generics/collections";
import { PackageDependency } from "domain/packages/index";
import { VersionLensExtension } from "../versionLensExtension";
import { ContextState } from "./contextState";
import { StateContributions } from "./eStateContributions";

export class VersionLensState {

  // states
  show: ContextState<boolean>;

  prereleasesEnabled: ContextState<boolean>;

  providerActive: ContextState<boolean>;

  providerBusy: ContextState<number>;

  providerError: ContextState<boolean>;

  providerOriginalParsedPackages: KeyDictionary<ContextState<KeyDictionary<PackageDependency[]>>> = {};

  providerEditedParsedPackages: KeyDictionary<ContextState<KeyDictionary<PackageDependency[]>>> = {};

  constructor(extension: VersionLensExtension, providerNames: string[]) {

    this.show = new ContextState(
      StateContributions.Show,
      extension.suggestions.showOnStartup
    );

    this.prereleasesEnabled = new ContextState(
      StateContributions.PrereleasesEnabled,
      extension.suggestions.showPrereleasesOnStartup
    );

    this.providerActive = new ContextState(
      StateContributions.ProviderActive,
      false
    );

    this.providerBusy = new ContextState(
      StateContributions.ProviderBusy,
      0
    );

    this.providerError = new ContextState(
      StateContributions.ProviderError,
      false
    );

    providerNames.forEach(providerName => {
      this.providerOriginalParsedPackages[providerName] = new ContextState(
        `versionlens.${providerName}.OriginalPackages`,
        {}
      );
      this.providerEditedParsedPackages[providerName] = new ContextState(
        `versionlens.${providerName}.EditedPackages`,
        {}
      );
    });
  }

  getOriginalParsedPackages(providerName: string, packagePath: string): PackageDependency[] {
    const state = this.providerOriginalParsedPackages[providerName];
    return state.value[packagePath];
  }

  setOriginalParsedPackages(
    providerName: string,
    packagePath: string,
    packages: PackageDependency[]
  ) {
    const state = this.providerOriginalParsedPackages[providerName];
    const current = state.value;
    const newValue = Object.assign(current, { [packagePath]: packages })
    state.change(newValue);
  }

  getEditedParsedPackages(providerName: string, packagePath: string): PackageDependency[] {
    const state = this.providerEditedParsedPackages[providerName];
    return state.value[packagePath];
  }

  setEditedParsedPackages(
    providerName: string,
    packagePath: string,
    packages: PackageDependency[]
  ) {
    const state = this.providerEditedParsedPackages[providerName];
    const current = state.value;
    const newValue = Object.assign(current, { [packagePath]: packages })
    state.change(newValue);
  }

}