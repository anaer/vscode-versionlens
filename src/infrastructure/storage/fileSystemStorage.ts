import fs from 'node:fs';
import util from 'node:util';
import { IStorage } from 'infrastructure/storage';
import { FileSystemWatcher, Uri, workspace } from 'vscode';

export const CrLf = '\r\n';
export const Lf = '\n';

const fsFileExists = util.promisify(fs.exists);
const fsReadFile = util.promisify(fs.readFile);

export class FileSystemStorage implements IStorage {

  fileExists(absFilePath: string): Promise<boolean> {
    return fsFileExists(absFilePath)
  }

  readFile(absFilePath: string): Promise<string> {
    return fsReadFile(absFilePath, "utf8")
  }

  async readJsonFile<T>(absFilePath: string): Promise<T> {
    const jsonContent = await this.readFile(absFilePath)
    return JSON.parse(jsonContent);
  }

  findFiles(include: string, exclude: string): Promise<Uri[]> {
    return <any>workspace.findFiles(include, exclude);
  }

  createFileSystemWatcher(pattern: string): FileSystemWatcher {
    return workspace.createFileSystemWatcher(pattern);
  }

}