import { ILogger } from 'domain/logging';
import { DependencyCache } from 'domain/packages';
import { IProviderConfig } from 'domain/providers';
import { ISuggestionProvider } from 'domain/suggestions';
import { IWorkspaceAdapter, PackageFileWatcher } from 'infrastructure/watcher';
import { test } from 'mocha-ui-esm';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { FileSystemWatcher } from 'vscode';

export const WatchTests = {

  [test.title]: PackageFileWatcher.prototype.watch.name,

  "watches files using a provider file pattern": async function () {
    // setup
    const mockWorkspace = mock<IWorkspaceAdapter>();
    const mockProvider = mock<ISuggestionProvider>();
    const mockCache = mock<DependencyCache>();
    const mockLogger = mock<ILogger>();
    const mockConfig = mock<IProviderConfig>()
    const mockFileSystemWatcher = mock<FileSystemWatcher>();

    const testProvider = instance(mockProvider);
    const testConfig = instance(mockConfig);

    when(mockProvider.name).thenReturn("test")

    when(mockConfig.fileMatcher).thenReturn({
      language: "",
      pattern: "**/package.json",
      scheme: "",
    });

    when(mockProvider.config).thenReturn(testConfig);

    when(mockWorkspace.createFileSystemWatcher(testConfig.fileMatcher.pattern))
      .thenReturn(instance(mockFileSystemWatcher))

    const watcher = new PackageFileWatcher(
      instance(mockWorkspace),
      [testProvider],
      instance(mockCache),
      instance(mockLogger)
    );

    // test
    watcher.watch();

    // verify
    verify(
      mockLogger.debug(
        "created watcher for '%s' with pattern '%s'",
        testProvider.name,
        testProvider.config.fileMatcher.pattern
      )
    ).once();

    verify(mockFileSystemWatcher.onDidCreate(anything())).once();
    verify(mockFileSystemWatcher.onDidDelete(anything())).once();
    verify(mockFileSystemWatcher.onDidChange(anything())).once();
  },

};