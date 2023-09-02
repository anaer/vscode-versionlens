import { ILogger } from 'domain/logging';
import { DependencyCache } from 'domain/packages';
import { IProviderConfig } from 'domain/providers';
import { ISuggestionProvider } from 'domain/suggestions';
import { IWorkspaceAdapter, PackageFileWatcher } from 'infrastructure/watcher';
import { test } from 'mocha-ui-esm';
import { instance, mock, verify, when } from 'ts-mockito';
import { Uri } from 'vscode';

export const InitializeTests = {

  [test.title]: PackageFileWatcher.prototype.initialize.name,

  "finds files using a provider file pattern": async function () {
    // setup
    const mockWorkspace = mock<IWorkspaceAdapter>();
    const mockProvider = mock<ISuggestionProvider>();
    const mockCache = mock<DependencyCache>();
    const mockLogger = mock<ILogger>();
    const mockConfig = mock<IProviderConfig>()
    const mockPackageFileWatcher = mock<PackageFileWatcher>();

    const testPackageFile = 'some-dir/package.json';
    const testProvider = instance(mockProvider);
    const testConfig = instance(mockConfig);
    const testUri = Uri.file(testPackageFile);
    const testStubWatcher = instance(mockPackageFileWatcher);

    when(mockConfig.fileMatcher).thenReturn({
      language: "",
      pattern: "**/package.json",
      scheme: "",
    });

    when(mockProvider.config).thenReturn(testConfig);

    when(mockWorkspace.findFiles(testConfig.fileMatcher.pattern, '**​/node_modules/**'))
      .thenResolve([testUri])

    const watcher = new PackageFileWatcher(
      instance(mockWorkspace),
      [testProvider],
      instance(mockCache),
      instance(mockLogger)
    );

    // override dependent functions with mocks
    watcher.onFileAdd = testStubWatcher.onFileAdd;
    watcher.watch = testStubWatcher.watch;

    // test
    await watcher.initialize();

    // verify
    verify(mockPackageFileWatcher.onFileAdd(testProvider, testUri)).once();
    verify(mockPackageFileWatcher.watch()).once();
  },

};