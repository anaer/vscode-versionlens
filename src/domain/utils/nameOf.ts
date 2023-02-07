import { PropertyNameDictionary } from "domain/generics";

export function nameOf<T>() {
  return new Proxy({}, {
    get: (_, prop) => prop,
    set: () => {
      throw Error('Set not supported');
    },
  }) as PropertyNameDictionary<T>;
}