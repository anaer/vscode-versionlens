import { KeyDictionary } from "domain/generics";
import { TYamlPackageTypeHandler } from "./tYamlPackageTypeHandler";

export type TYamlPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TYamlPackageTypeHandler>;
}