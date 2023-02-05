import { IServiceProvider } from "./iServiceProvider";

type TServiceResolverFunction<T> = (...args: Array<any>) => T;

type TServiceResolverValue<T> = T;

export type TServiceResolverAsyncFunction<T> = Promise<TServiceResolverFunction<Promise<T>>>

export type TServiceResolver<T> = TServiceResolverFunction<T>
  | TServiceResolverAsyncFunction<T>
  | TServiceResolverValue<T>


export interface IServiceCollection {

  addSingleton: <T>(
    name: string,
    descriptor: TServiceResolver<T>
  ) => IServiceCollection;

  build: () => Promise<IServiceProvider>;

  buildScope(name: string,serviceProvider: IServiceProvider): Promise<IServiceProvider>;

}