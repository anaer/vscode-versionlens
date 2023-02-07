import { IServiceProvider } from "./iServiceProvider";

type TServiceResolverFunction<T> = (...args: Array<any>) => T;

type TServiceResolverValue<T> = T;

export type TServiceResolverAsyncFunction<T> = Promise<TServiceResolverFunction<Promise<T>>>

export type TServiceResolver<T> = TServiceResolverFunction<T>
  | TServiceResolverAsyncFunction<T>
  | TServiceResolverValue<T>

export enum ServiceLifetime {
  singleton = "singleton",
  scoped = "scoped",
  transient = "transient"
}

export enum ServiceInjectionMode {
  classic = "classic",
  proxy = "proxy"
}

export interface IServiceCollection {

  addSingleton: <T>(
    name: string,
    descriptor: TServiceResolver<T>,
    injectionMode?: ServiceInjectionMode
  ) => IServiceCollection;

  addScoped: <T>(
    name: string,
    descriptor: TServiceResolver<T>,
    injectionMode?: ServiceInjectionMode
  ) => IServiceCollection;

  build: () => Promise<IServiceProvider>;

  buildChild(name: string, serviceProvider: IServiceProvider): Promise<IServiceProvider>;

}