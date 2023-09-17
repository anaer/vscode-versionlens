import { SuggestionCategory } from './eSuggestionCategory'
import { SuggestionTypes } from './eSuggestionTypes'

export type TPackageSuggestion = {

  type: SuggestionTypes,

  category: SuggestionCategory,

  name: string,

  version: string,

}