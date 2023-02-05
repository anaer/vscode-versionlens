import { asValue, AwilixContainer, Resolver } from "awilix";
import { KeyDictionary } from "domain/generics";

export async function registerAsyncSingletons(
  container: AwilixContainer<any>,
  asyncSingletons: KeyDictionary<any>
): Promise<KeyDictionary<Resolver<any>>> {

  const asyncKeys = Object.keys(asyncSingletons)
  const asyncResolvers: KeyDictionary<Resolver<any>> = {};

  for (const key of asyncKeys) {
    const fn = asyncSingletons[key];
    const argsMatch = /\(([^)]*)/.exec(fn.toString())
    const args = argsMatch[1].split(",");
    const mappedArgs = args.map(a => container.resolve(a.trim()));

    const awilixResolver = asValue(
      await asyncSingletons[key](...mappedArgs)
    );
    asyncResolvers[key] = awilixResolver;
  }

  return asyncResolvers;
}