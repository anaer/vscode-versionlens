import { IVsCodeWorkspace } from 'domain/configuration';
import { IConfig } from 'domain/configuration';

export class VsCodeWorkspaceStub implements IVsCodeWorkspace {
  getConfiguration(section: any): IConfig {
    return {
      get: (key: string) => { throw new Error("Not implemented"); }
    };
  }
}
