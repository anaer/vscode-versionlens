import { ISuggestionProvider } from "domain/suggestions";

export interface ApplicationService {

  suggestionProviders: Array<ISuggestionProvider>

  providerNames: Array<string>,

}