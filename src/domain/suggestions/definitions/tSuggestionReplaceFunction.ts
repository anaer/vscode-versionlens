import { PackageResponse } from "domain/packages";

export type TSuggestionReplaceFunction = (

  response: PackageResponse,

  version: string

) => string;