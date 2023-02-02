import { IConfig, iConfigResolver } from 'domain/configuration';

export class ConfigResolverStub implements iConfigResolver {
  getConfiguration(section: string): IConfig {
    return {
      get: (key: string) => { throw new Error("Not implemented"); }
    };
  }
}
