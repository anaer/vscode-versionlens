import { throwNull, throwUndefined } from '@esm-test/guards';
import { Undefinable } from 'domain/generics';
import { IFrozenOptions, IOptions } from '.';

export abstract class Options implements IOptions {

  constructor(
    readonly config: IFrozenOptions, 
    protected section: string
  ) {
    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("section", <any>section);
    throwNull("section", <any>section);

    this.config = config;
    this.section = (section.length > 0) ? section + '.' : '';
  }

  get<T>(key: string): Undefinable<T> {
    return this.config.get(`${this.section}${key}`);
  }

  defrost(): void {
    this.config.defrost();
  }

}