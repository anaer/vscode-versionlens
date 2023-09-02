import { IWorkspaceAdapter } from "./iWorkspaceAdapter";

export interface IStorage extends IWorkspaceAdapter {

  fileExists(absFilePath: string): Promise<boolean>;

  readFile(absFilePath: string): Promise<string>;

  readJsonFile<T>(absFilePath: string): Promise<T>;

}