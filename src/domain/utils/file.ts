import fs from 'node:fs';
import util from 'node:util';

export const CrLf = '\r\n';
export const Lf = '\n';

const fsFileExists = util.promisify(fs.exists);
const fsReadFile = util.promisify(fs.readFile);

export function fileExists(absFilePath: string): Promise<boolean> {
  return fsFileExists(absFilePath)
}

export function readFile(absFilePath: string): Promise<string> {
  return fsReadFile(absFilePath, "utf8")
}

export async function readJsonFile<T>(absFilePath: string): Promise<T> {
  const jsonContent = await readFile(absFilePath)
  return JSON.parse(jsonContent);
}