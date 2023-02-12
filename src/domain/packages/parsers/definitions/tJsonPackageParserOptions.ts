import { KeyDictionary } from "domain/generics";
import { TJsonPackageTypeHandler } from "./tJsonPackageTypeHandler";

export type TJsonPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler>;
}