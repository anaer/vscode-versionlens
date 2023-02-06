import { IConfig } from './definitions/iConfig';
import { TConfigSectionResolver } from './definitions/tConfigResolver';
import { IFrozenOptions } from './definitions/iOptions';

/**
 * Configuration container.
 * 
 * Caches the configuration which can improve performance. i.e. when reading from a file source.
 * 
 * Can be defrosted using defrost() to fetch most recent settings from the source.
 */
export class AppConfig implements IFrozenOptions {

  constructor(resolver: TConfigSectionResolver, section: string) {
    this.resolver = resolver;
    this.section = section;
    this.frozen = null;
  }

  /**
   * Cached configuration
   */
  protected frozen: IConfig;

  /**
   * The section key fetched from the configuration source data
   * 
   * @example `versionlens`
   */
  section: string;

  /**
   * The function that reads from the configuration source
   */
  resolver: TConfigSectionResolver;

  private get raw(): IConfig {
    return this.resolver(this.section);
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