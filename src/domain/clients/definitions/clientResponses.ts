import { KeyDictionary } from 'domain/generics';

export enum ClientResponseSource {
  remote = 'remote',
  cache = 'cache',
  local = 'local',
  cli = 'cli'
}

export type ClientResponse<TStatus, TData> = {
  source: ClientResponseSource;
  status: TStatus;
  data: TData;
  rejected?: boolean;
}

export type HttpClientResponse = ClientResponse<number, string>;

export type JsonClientResponse = ClientResponse<number, KeyDictionary<any>>;

export type ProcessClientResponse = ClientResponse<string, string>;