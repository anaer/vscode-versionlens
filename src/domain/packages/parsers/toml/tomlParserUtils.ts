import { AST } from "toml-eslint-parser";

export function complexHasProperty(node: AST.TOMLKeyValue, type: string) {
  const index = node.key.keys.findIndex((x: AST.TOMLBare) => x.name === type);
  return index > -1;
}