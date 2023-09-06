import { FileSystemWatcher, Uri, workspace } from 'vscode';
import { IWorkspaceAdapter } from './iWorkspaceAdapter';

export class WorkspaceAdapter implements IWorkspaceAdapter {

  findFiles(include: string, exclude: string): Promise<Uri[]> {
    return <any>workspace.findFiles(include, exclude);
  }

  createFileSystemWatcher(pattern: string): FileSystemWatcher {
    return workspace.createFileSystemWatcher(pattern);
  }

}