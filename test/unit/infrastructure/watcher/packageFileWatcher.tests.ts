import { ILogger } from 'domain/logging';
import { DependencyCache, PackageDependency } from 'domain/packages';
import { IProviderConfig } from 'domain/providers';
import { GetDependencyChanges, ISuggestionProvider } from 'domain/suggestions';
import { IWorkspaceAdapter, PackageFileWatcher } from 'infrastructure/watcher';
import { test } from 'mocha-ui-esm';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { FileSystemWatcher, Uri } from 'vscode';

type TestContext = {
  mockGetDependencyChanges: GetDependencyChanges,
  mockWorkspace: IWorkspaceAdapter;
  mockProvider: ISuggestionProvider;
  mockCache: DependencyCache;
  mockLogger: ILogger;
  mockConfig: IProviderConfig;
  mockPackageFileWatcher: PackageFileWatcher
}

export const packageFileWatcherTests = {

  [test.title]: PackageFileWatcher.name,

  beforeEach: function (this: TestContext) {
    this.mockGetDependencyChanges = mock<GetDependencyChanges>();
    this.mockWorkspace = mock<IWorkspaceAdapter>();
    this.mockProvider = mock<ISuggestionProvider>();
    this.mockCache = mock<DependencyCache>();
    this.mockLogger = mock<ILogger>();
    this.mockConfig = mock<IProviderConfig>()
    this.mockPackageFileWatcher = mock<PackageFileWatcher>();

    when(this.mockProvider.name).thenReturn("test provider");
  },

  initialize: {
    "finds files using a provider file pattern": async function (this: TestContext) {
      // setup
      const testProvider = instance(this.mockProvider);
      const testConfig = instance(this.mockConfig);
      const testUri: Uri = <any>{ fsPath: 'some-dir/package.json' };

      when(this.mockConfig.fileMatcher).thenReturn({
        language: "",
        pattern: "**/package.json",
        scheme: "",
      });

      when(this.mockProvider.config).thenReturn(testConfig);

      when(this.mockWorkspace.findFiles(testConfig.fileMatcher.pattern, '**​/node_modules/**'))
        .thenResolve([testUri])

      const watcher = new PackageFileWatcher(
        instance(this.mockGetDependencyChanges),
        instance(this.mockWorkspace),
        [testProvider],
        instance(this.mockCache),
        instance(this.mockLogger)
      );

      // override dependent functions with mocks
      const stubWatcher = instance(this.mockPackageFileWatcher);
      watcher.onFileAdd = stubWatcher.onFileAdd;
      watcher.watch = stubWatcher.watch;

      // test
      await watcher.initialize();

      // verify
      verify(this.mockPackageFileWatcher.onFileAdd(testProvider, testUri)).once();
      verify(this.mockPackageFileWatcher.watch()).once();
    },
  },

  watch: {
    "watches files using a provider file pattern": async function (this: TestContext) {
      // setup
      const mockFileSystemWatcher = mock<FileSystemWatcher>();
      const testProvider = instance(this.mockProvider);
      const testConfig = instance(this.mockConfig);

      when(this.mockConfig.fileMatcher).thenReturn({
        language: "",
        pattern: "**/package.json",
        scheme: "",
      });

      when(this.mockProvider.config).thenReturn(testConfig);

      when(this.mockWorkspace.createFileSystemWatcher(testConfig.fileMatcher.pattern))
        .thenReturn(instance(mockFileSystemWatcher))

      const watcher = new PackageFileWatcher(
        instance(this.mockGetDependencyChanges),
        instance(this.mockWorkspace),
        [testProvider],
        instance(this.mockCache),
        instance(this.mockLogger)
      );

      // test
      watcher.watch();

      // verify
      verify(
        this.mockLogger.debug(
          "created watcher for '%s' with pattern '%s'",
          testProvider.name,
          testProvider.config.fileMatcher.pattern
        )
      ).once();

      verify(mockFileSystemWatcher.onDidCreate(anything())).once();
      verify(mockFileSystemWatcher.onDidDelete(anything())).once();
      verify(mockFileSystemWatcher.onDidChange(anything())).once();
    },
  },

  onFileChange: {

    "doesn't call changed listener when dependencies haven't changed": async function (this: TestContext) {
      // setup
      const testProvider = instance(this.mockProvider);
      const testUri: Uri = <any>{ fsPath: 'some-dir/package.json' };

      when(this.mockGetDependencyChanges.execute(testProvider, testUri.fsPath))
        .thenResolve({
          parsedDependencies: [],
          hasChanged: false
        });

      const watcher = new PackageFileWatcher(
        instance(this.mockGetDependencyChanges),
        instance(this.mockWorkspace),
        [],
        instance(this.mockCache),
        instance(this.mockLogger)
      );

      // override dependent functions with mocks
      const stubWatcher = instance(this.mockPackageFileWatcher);
      watcher.packageDependenciesChangedListener = stubWatcher.packageDependenciesChangedListener;

      // test
      await watcher.onFileChange(testProvider, testUri);

      // verify
      verify(
        this.mockLogger.silly(
          "file changed '%s'",
          testUri
        )
      ).once();

      verify(
        this.mockGetDependencyChanges.execute(testProvider, testUri.fsPath),
      ).once()

      verify(
        this.mockCache.set(anything(), anything(), anything())
      ).never();

      verify(
        this.mockPackageFileWatcher.packageDependenciesChangedListener(
          anything(),
          anything(),
          anything()
        )
      ).never();
    },

    "calls changed listener when dependencies have changed": async function (this: TestContext) {
      // setup
      const stubWatcher = instance(this.mockPackageFileWatcher);
      const testProvider = instance(this.mockProvider);
      const testUri: Uri = <any>{ fsPath: 'some-dir/package.json' };
      const testNewDependencies = [
        <PackageDependency>{
          package: {
            name: "test-package",
            version: "1.2.3",
            path: testUri.fsPath
          }
        }
      ];

      when(this.mockGetDependencyChanges.execute(testProvider, testUri.fsPath))
        .thenResolve({
          parsedDependencies: testNewDependencies,
          hasChanged: true
        });

      const watcher = new PackageFileWatcher(
        instance(this.mockGetDependencyChanges),
        instance(this.mockWorkspace),
        [],
        instance(this.mockCache),
        instance(this.mockLogger)
      );

      watcher.packageDependenciesChangedListener = stubWatcher.packageDependenciesChangedListener;

      // test
      await watcher.onFileChange(testProvider, testUri);

      // verify
      verify(
        this.mockLogger.silly(
          "file changed '%s'",
          testUri
        )
      ).once();

      verify(
        this.mockGetDependencyChanges.execute(testProvider, testUri.fsPath),
      ).once()

      verify(
        this.mockLogger.debug(
          "updating package dependency cache for '%s'",
          testUri.fsPath
        )
      ).once();

      verify(
        this.mockCache.set(
          testProvider.name,
          testUri.fsPath,
          testNewDependencies
        )
      ).once();

      verify(
        this.mockPackageFileWatcher.packageDependenciesChangedListener(
          testProvider,
          testUri.fsPath,
          testNewDependencies
        )
      ).once();
    }
  }
};