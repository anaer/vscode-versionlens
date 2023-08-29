import { SuggestionTypes } from "./eSuggestionTypes"

export type TPackageSuggestion = {

  type: SuggestionTypes,

  name: string,

  version: string,

}