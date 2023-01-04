import { IFrozenOptions, OptionsWithFallback } from 'domain/configuration';
import { IHttpOptions, HttpContributions } from 'domain/clients';
import { Nullable } from 'domain/generics';

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