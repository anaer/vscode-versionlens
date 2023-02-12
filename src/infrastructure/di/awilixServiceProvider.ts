import { AwilixContainer } from 'awilix'
import { IServiceProvider } from 'domain/di'

export class AwilixServiceProvider implements IServiceProvider {

  constructor(name: string, container: AwilixContainer) {
    this.name = name;
    this.container = container;
  }

  name: string;

  container: AwilixContainer;

  getService<T>(name: string): T {
    return this.container.resolve<T>(name);
  }

  dispose() {
    return this.container.dispose();
  }

}