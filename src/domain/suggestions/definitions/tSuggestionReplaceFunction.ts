import { TSuggestionUpdate } from "domain/suggestions";

export type TSuggestionReplaceFunction = (

  suggestionUpdate: TSuggestionUpdate,

  version: string

) => string;