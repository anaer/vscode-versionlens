import { TAsyncFunction } from "domain/generics";
import { ExpiryCacheEntry, IExpiryCache } from "./iExpiryCache";
import { MemoryCache } from "./memoryCache";

export class MemoryExpiryCache implements IExpiryCache {

  cache: MemoryCache;

  constructor(cacheName: string) {
    this.cache = new MemoryCache(cacheName);
  }

  async getOrCreate<T>(
    key: string,
    methodToCache: TAsyncFunction<T>,
    duration: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    const result = cached != undefined
      ? cached
      : this.set(key, await methodToCache(), duration);

    return result;
  }

  get<T>(key: string): T {
    const entry = this.cache.get<ExpiryCacheEntry<T>>(key);
    if (!entry) {
      return undefined;
    }

    // check if the entry has expired
    if (Date.now() >= entry.expiryTime) {
      return undefined;
    }

    // return the cached data
    return entry.data;
  }

  set<T>(key: string, data: T, duration: number): T {
    const expiryTime = Date.now() + duration;
    const newEntry = {
      expiryTime,
      data
    };
    this.cache.set<ExpiryCacheEntry<T>>(key, newEntry);
    return newEntry.data;
  }

  clear() {
    this.cache.clear();
  }

  hasExpired<T>(key: string): boolean {
    const entry = this.cache.get<ExpiryCacheEntry<T>>(key);
    if (!entry) {
      return true;
    }

    return Date.now() >= entry.expiryTime;
  }

  expire<T>(key: string): T {
    const entry = this.get<T>(key);
    if (entry) {
      this.cache.remove(key)
    }

    return entry;
  }

}