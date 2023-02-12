import { Undefinable } from 'domain/generics';
import { IFrozenOptions, IOptions } from '.';

export abstract class Options implements IOptions {

  protected section: string;

  config: IFrozenOptions;

  constructor(config: IFrozenOptions, section: string) {
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