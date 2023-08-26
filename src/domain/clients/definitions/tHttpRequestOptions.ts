import { IHttpOptions } from "./iHttpOptions";
import { ICachingOptions } from "../../caching/definitions/iCachingOptions";

export type HttpRequestOptions = {

    caching: ICachingOptions,

    http: IHttpOptions,

}