import { KeyDictionary } from "domain/generics/collections";
import { PackageDependency } from "domain/packages/index";
import { StateContributions } from "../definitions/eStateContributions";
import { VersionLensExtension } from "../versionLensExtension";
import { ContextState } from "./contextState";

export class VersionLensState {

  // states
  enabled: ContextState<boolean>;

  prereleasesEnabled: ContextState<boolean>;

  installedStatusesEnabled: ContextState<boolean>;

  providerActive: ContextState<boolean>;

  providerBusy: ContextState<number>;

  providerError: ContextState<boolean>;

  providerSupportsPrereleases: ContextState<boolean>;

  providerOriginalParsedPackages: KeyDictionary<ContextState<KeyDictionary<PackageDependency[]>>> = {};

  providerRecentParsedPackages: KeyDictionary<ContextState<KeyDictionary<PackageDependency[]>>> = {};

  constructor(extension: VersionLensExtension, providerNames: string[]) {

    this.enabled = new ContextState(
      StateContributions.Enabled,
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

    this.providerSupportsPrereleases = new ContextState(
      StateContributions.ProviderSupportsPrereleases,
      false
    );

    providerNames.forEach(providerName => {
      this.providerOriginalParsedPackages[providerName] = new ContextState(
        `versionlens.${providerName}.OriginalPackages`,
        {}
      );
      this.providerRecentParsedPackages[providerName] = new ContextState(
        `versionlens.${providerName}.RecentPackages`,
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

  getRecentParsedPackages(providerName: string, packagePath: string): PackageDependency[] {
    const state = this.providerRecentParsedPackages[providerName];
    return state.value[packagePath];
  }

  setRecentParsedPackages(
    providerName: string,
    packagePath: string,
    packages: PackageDependency[]
  ) {
    const state = this.providerRecentParsedPackages[providerName];
    const current = state.value;
    const newValue = Object.assign(current, { [packagePath]: packages })
    state.change(newValue);
  }

}