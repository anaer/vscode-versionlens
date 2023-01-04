import { ISuggestionProvider } from "domain/suggestions";

export interface IProviderModule {

  configureContainer(container: any): ISuggestionProvider

}