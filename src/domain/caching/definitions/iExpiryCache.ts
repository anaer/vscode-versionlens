import { TAsyncFunction } from "domain/generics";

export type ExpiryCacheEntry<T> = {
  expiryTime: number,
  data: T
};

export interface IExpiryCache {

  getOrCreate<T>(key: string, methodToCache: TAsyncFunction<T>, duration: number): Promise<T>;

  get<T>(key: string): T;

  set<T>(key: string, data: T, expiration: number): T;

  clear();

  hasExpired<T>(key: string): boolean;

  expire<T>(key: string): T;

}