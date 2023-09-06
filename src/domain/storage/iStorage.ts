export interface IStorage {

  fileExists(absFilePath: string): Promise<boolean>;

  readFile(absFilePath: string): Promise<string>;

  readJsonFile<T>(absFilePath: string): Promise<T>;

}