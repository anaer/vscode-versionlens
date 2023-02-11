import { KeyDictionary } from "domain/generics";
import { TPackageTypeHandler } from "./tPackageTypeHandler";

export type TYamlPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TPackageTypeHandler>;
}