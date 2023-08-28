import { throwUndefinedOrNull } from "@esm-test/guards";
import { VersionLensExtension } from "../versionLensExtension";
import { ContextState } from "./contextState";
import { StateContributions } from "./eStateContributions";

export class VersionLensState {

  // states
  show: ContextState<boolean>;

  showPrereleases: ContextState<boolean>;

  providerActive: ContextState<boolean>;

  providerBusy: ContextState<number>;

  providerError: ContextState<boolean>;

  constructor(extension: VersionLensExtension) {
    throwUndefinedOrNull("extension", extension);

    this.show = new ContextState(
      StateContributions.Show,
      extension.suggestions.showOnStartup
    );

    this.showPrereleases = new ContextState(
      StateContributions.ShowPrereleases,
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

  }

}