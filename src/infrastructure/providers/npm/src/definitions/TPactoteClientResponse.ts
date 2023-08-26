import { TClientResponse } from "domain/clients";
import { KeyDictionary } from "domain/generics";

export type TPacoteData = {

  name: string;

  versions: KeyDictionary<any>;

  "dist-tags": KeyDictionary<string>;

}

export type TPactoteClientResponse = TClientResponse<number, TPacoteData>