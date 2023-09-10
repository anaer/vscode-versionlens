import { throwUndefinedOrNull } from "@esm-test/guards";
import { SuggestionsOptions } from "presentation.extension";
import { ContextState } from "./contextState";
import { StateContributions } from "./eStateContributions";

export class VersionLensState {

  show: ContextState<boolean>;

  showPrereleases: ContextState<boolean>;

  showOutdated: ContextState<boolean>;

  providerActive: ContextState<boolean>;

  providerBusy: ContextState<number>;

  providerError: ContextState<boolean>;

  constructor(private readonly suggestionOptions: SuggestionsOptions) {
    throwUndefinedOrNull("suggestionOptions", this.suggestionOptions);

    this.show = new ContextState(StateContributions.Show);
    this.showPrereleases = new ContextState(StateContributions.ShowPrereleases);
    this.showOutdated = new ContextState(StateContributions.ShowOutdated);
    this.providerActive = new ContextState(StateContributions.ProviderActive);
    this.providerBusy = new ContextState(StateContributions.ProviderBusy);
    this.providerError = new ContextState(StateContributions.ProviderError);
  }

  async applyDefaults(): Promise<void> {
    await this.show.change(this.suggestionOptions.showOnStartup);
    await this.showPrereleases.change(this.suggestionOptions.showPrereleasesOnStartup);
    await this.showOutdated.change(false);
    await this.providerActive.change(false);
    await this.providerBusy.change(0);
    await this.providerError.change(false);
  }

  async increaseBusyState(): Promise<void> {
    await this.providerBusy.change(this.providerBusy.value + 1);
  }

  async decreaseBusyState(): Promise<void> {
    await this.providerBusy.change(this.providerBusy.value - 1);
  }

  async clearBusyState(): Promise<void> {
    await this.providerBusy.change(0);
  }

  async setErrorState(): Promise<void> {
    await this.providerError.change(true);
  }

  async clearErrorState(): Promise<void> {
    await this.providerError.change(false);
  }

}