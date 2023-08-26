import { IHttpOptions } from "domain/http";
import { ICachingOptions } from "../../caching/definitions/iCachingOptions";

export type HttpClientOptions = {

    caching: ICachingOptions,

    http: IHttpOptions,

}