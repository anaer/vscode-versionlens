import { throwNull, throwUndefined } from '@esm-test/guards';
import { AwilixContainer } from 'awilix';
import { IServiceProvider } from 'domain/di';

export class AwilixServiceProvider implements IServiceProvider {

  constructor(
    readonly name: string, 
    readonly container: AwilixContainer
  ) {
    throwUndefined("name", <any>name);
    throwNull("name", <any>name);

    throwUndefined("container", container);
    throwNull("container", container);
  }

  getService<T>(name: string): T {
    return this.container.resolve<T>(name);
  }

  dispose() {
    return this.container.dispose();
  }

}