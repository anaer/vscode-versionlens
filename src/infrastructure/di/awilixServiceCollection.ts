import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  InjectionMode
} from 'awilix';
import {
  IServiceCollection,
  IServiceProvider,
  TServiceResolver
} from 'domain/di';
import { KeyDictionary } from 'domain/generics';
import { DomainService } from 'domain/services/eDomainService';
import { AwilixServiceProvider } from './awilixServiceProvider';
import { registerAsyncSingletons } from './awillixUtils';

const AsyncFunction = async function () { }.constructor;

export class AwilixServiceCollection implements IServiceCollection {

  private resolvers: KeyDictionary<TServiceResolver<any>> = {};

  private asyncSingletons: KeyDictionary<any> = {};

  addSingleton<T>(name: string, resolver: TServiceResolver<T>): IServiceCollection {
    let awilixResolver: any;

    if (resolver instanceof AsyncFunction) {
      // @ts-ignore
      this.asyncSingletons[name] = resolver;
    } else if (resolver instanceof Function) {
      awilixResolver = asFunction(resolver).scoped().singleton();
    } else {
      awilixResolver = asValue(resolver);
    }

    this.resolvers[name] = awilixResolver;

    return this;
  }

  build(): Promise<IServiceProvider> {
    const container: AwilixContainer<any> = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    });

    return this.buildAwilixContainer("root", container);
  }

  async buildScope(
    name: string,
    serviceProvider: IServiceProvider
  ): Promise<IServiceProvider> {
    // @ts-ignore
    const container: AwilixContainer<any> = serviceProvider.container;

    const childContainer = container.createScope();

    return await this.buildAwilixContainer(
      name,
      childContainer
    );
  }

  private async buildAwilixContainer(
    name,
    container: AwilixContainer<any>
  ): Promise<IServiceProvider> {
    // add the service provider to the container
    const serviceProvider = new AwilixServiceProvider(name, container);
    this.addSingleton(DomainService.serviceProvider, serviceProvider);

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
