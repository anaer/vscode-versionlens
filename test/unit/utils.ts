import path from 'path';

// expects test bundle to be at ./dist/[filename].js
export const projectPath = path.resolve(__dirname, '..');

export const sourcePath = path.resolve(projectPath, 'src');

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