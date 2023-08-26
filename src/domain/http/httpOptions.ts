import { IFrozenOptions, OptionsWithFallback } from 'domain/configuration';
import { Nullable } from 'domain/generics';
import { HttpContributions } from './eHttpContributions';
import { IHttpOptions } from './iHttpOptions';

export class HttpOptions extends OptionsWithFallback implements IHttpOptions {

  constructor(
    config: IFrozenOptions,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  get strictSSL(): boolean {
    return this.getOrDefault<boolean>(
      HttpContributions.StrictSSL,
      true
    );
  }

}