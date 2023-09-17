import { KeyDictionary } from 'domain/utils';
import { TYamlPackageTypeHandler } from "./tYamlPackageTypeHandler";

export type TYamlPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TYamlPackageTypeHandler>;
}