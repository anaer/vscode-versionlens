import fs from 'node:fs';
import util from 'node:util';

const fsReadFile = util.promisify(fs.readFile);

export function readFile(absFilePath: string): Promise<string> {
  return fsReadFile(absFilePath, "utf8")
}

export async function readJsonFile<T>(absFilePath: string): Promise<T> {
  const jsonContent = await readFile(absFilePath)
  return JSON.parse(jsonContent);
}