import { IConfig } from './definitions/iConfig';
import { iConfigResolver } from './definitions/iConfigResolver';
import { IFrozenOptions } from './definitions/iOptions';

// allows vscode configuration to be defrosted
// Useful for accessing hot changing values from settings.json
// Stays frozen until defrost() is called and then refrosts
export class AppConfig implements IFrozenOptions {

  protected frozen: IConfig;

  section: string;

  configResolver: iConfigResolver;

  constructor(configResolver: iConfigResolver, section: string) {
    this.configResolver = configResolver;
    this.section = section;
    this.frozen = null;
  }

  protected get raw(): IConfig {
    return this.configResolver.getConfiguration(this.section);
  }

  get<T>(key: string): T {
    if (this.frozen === null) {
      this.frozen = this.raw;
    }

    return this.frozen.get(key);
  }

  defrost() {
    this.frozen = null;
  }

}