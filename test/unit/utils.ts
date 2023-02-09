import path from 'node:path';
import fs from 'node:fs';
import util from 'node:util';

const fsMkDir = util.promisify(fs.mkdir);
const fsRmDir = util.promisify(fs.rmdir);
const fsWriteFile = util.promisify(fs.writeFile);
const fsUnlink = util.promisify(fs.unlink);

// expects test bundle to be at ./dist/[filename].js
export const projectPath = path.resolve(__dirname, '..');

export const sourcePath = path.resolve(projectPath, 'src');

export const filePath = (stackIndex: number = 2) => {
  const error = new Error();
  const filePart = error.stack.split('\n')[stackIndex]
  const matches = /[\\.].*\s/.exec(filePart);
  return path.resolve(projectPath, matches[0].trim());
}

export const fileDir = () => path.dirname(filePath(3))

export const createDir = async (...paths: Array<string>): Promise<string> => {
  const fullPath = path.join(...paths);
  await fsMkDir(fullPath, { recursive: true })
  return fullPath;
}

export const removeDir = async (...paths: Array<string>): Promise<void> => {
  const deletePaths = paths.concat();
  for (let index = paths.length - 1; index > 0; index--) {
    const deletePath = path.resolve(...deletePaths);
    await fsRmDir(deletePath);
    deletePaths.splice(index, 1);
  }
}

export const createFile = (filePath: string, content: string): Promise<void> => {
  return fsWriteFile(filePath, content, "utf-8");
}

export const removeFile = (filePath: string): Promise<void> => {
  return fsUnlink(filePath);
}

export async function delay(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(null);
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}