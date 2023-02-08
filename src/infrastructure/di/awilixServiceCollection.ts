import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer
} from 'awilix';
import {
  IServiceCollection,
  IServiceProvider,
  ServiceInjectionMode,
  ServiceLifetime,
  TServiceResolver
} from 'domain/di';
import { KeyDictionary, AsyncFunction } from 'domain/generics';
import { DomainService } from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceProvider } from './awilixServiceProvider';
import { registerAsyncSingletons } from './awillixUtils';

export class AwilixServiceCollection implements IServiceCollection {

  private resolvers: KeyDictionary<TServiceResolver<any>> = {};

  private asyncSingletons: KeyDictionary<any> = {};

  addSingleton<T>(
    name: string,
    resolver: TServiceResolver<T>,
    injectionMode: ServiceInjectionMode = ServiceInjectionMode.proxy
  ): IServiceCollection {
    this.add(name, resolver, ServiceLifetime.singleton, injectionMode);
    return this;
  }

  addScoped<T>(
    name: string,
    resolver: TServiceResolver<T>,
    injectionMode: ServiceInjectionMode = ServiceInjectionMode.proxy
  ): IServiceCollection {
    this.add(name, resolver, ServiceLifetime.scoped, injectionMode);
    return this;
  }

  build(): Promise<IServiceProvider> {
    const container: AwilixContainer<any> = createContainer();
    return this.buildAwilixContainer("root", container);
  }

  async buildChild(
    name: string,
    serviceProvider: IServiceProvider
  ): Promise<IServiceProvider> {
    const container: AwilixContainer<any> = (<any>serviceProvider).container;
    const childContainer = container.createScope();
    return await this.buildAwilixContainer(
      name,
      childContainer
    );
  }

  private add<T>(
    name: string,
    resolver: TServiceResolver<T>,
    lifetime: ServiceLifetime,
    injectionMode: ServiceInjectionMode
  ): IServiceCollection {
    let awilixResolver: any;

    if (resolver instanceof AsyncFunction) {
      this.asyncSingletons[name] = resolver;
    } else if (resolver instanceof Function) {
      awilixResolver = asFunction(resolver)[injectionMode]()[lifetime]();
    } else {
      awilixResolver = asValue(resolver);
    }

    this.resolvers[name] = awilixResolver;

    return this;
  }

  private async buildAwilixContainer(
    name: string,
    container: AwilixContainer<any>
  ): Promise<IServiceProvider> {

    // add the service provider to the container
    const serviceProvider = new AwilixServiceProvider(name, container);
    this.addSingleton(
      nameOf<DomainService>().serviceProvider,
      serviceProvider
    );

    // register sync
    container.register(this.resolvers);

    // register async
    container.register(
      await registerAsyncSingletons(
        container,
        this.asyncSingletons
      )
    );

    return serviceProvider;
  }

}