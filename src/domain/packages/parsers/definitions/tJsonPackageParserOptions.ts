import { KeyDictionary } from 'domain/utils';
import { TJsonPackageTypeHandler } from "./tJsonPackageTypeHandler";

export type TJsonPackageParserOptions = {
  includePropNames: Array<string>,
  complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler>;
}