import { NpaSpec } from "../models/npaSpec.js"

export interface INpmRegistry {

  pickRegistry: (spec: NpaSpec, opts: any) => string;

  json: (url: string, opts: any) => Promise<any>;

}