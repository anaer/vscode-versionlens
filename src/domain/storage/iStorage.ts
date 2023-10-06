export interface IStorage {

  readFile(absFilePath: string): Promise<string>;

  readJsonFile<T>(absFilePath: string): Promise<T>;

}