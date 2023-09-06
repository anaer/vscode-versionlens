import assert from "assert";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageDependency } from "domain/packages";
import { IStorage } from "domain/storage";
import { GetDependencyChanges, ISuggestionProvider } from "domain/suggestions";
import { test } from "mocha-ui-esm";
import { instance, mock, when } from "ts-mockito";

type TestContext = {
  mockStorage: IStorage;
  mockCache: DependencyCache;
  mockLogger: ILogger;
  mockProvider: ISuggestionProvider;
}

export const getDependencyChangesTests = {

  [test.title]: GetDependencyChanges.name,

  beforeEach: function (this: TestContext) {
    this.mockStorage = mock<IStorage>();
    this.mockCache = mock<DependencyCache>();
    this.mockLogger = mock<ILogger>();
    this.mockProvider = mock<ISuggestionProvider>();
  },

  "returns empty array when has no changes": async function (this: TestContext) {
    const testProvider = instance(this.mockProvider)
    const testPackageFilePath = `some/path/package.json`;
    const testFileContent = `{"test": "1.2.3"}`;

    when(this.mockCache.get(testProvider.name, testPackageFilePath))
      .thenReturn([]);

    when(this.mockStorage.readFile(testPackageFilePath)).thenResolve(testFileContent);

    when(this.mockProvider.parseDependencies(testPackageFilePath, testFileContent))
      .thenReturn([]);

    const getDependencyChanges = new GetDependencyChanges(
      instance(this.mockStorage),
      instance(this.mockCache),
      instance(this.mockLogger)
    )

    // test
    const actual = await getDependencyChanges.execute(
      testProvider,
      testPackageFilePath
    );

    // assert
    assert.equal(actual.length, 0);
  },

  "returns latest dependencies when has changes": async function (this: TestContext) {
    const testProvider = instance(this.mockProvider)
    const testPackageFilePath = `some/path/package.json`;
    const testFileContent = `{"test": "1.2.3"}`;
    const testNewDependencies = [
      <PackageDependency>{
        package: {
          name: "test-package",
          version: "1.2.3",
          path: testPackageFilePath
        }
      }
    ];

    when(this.mockCache.get(testProvider.name, testPackageFilePath))
      .thenReturn([]);

    when(this.mockStorage.readFile(testPackageFilePath)).thenResolve(testFileContent);

    when(this.mockProvider.parseDependencies(testPackageFilePath, testFileContent))
      .thenReturn(testNewDependencies);

    const getDependencyChanges = new GetDependencyChanges(
      instance(this.mockStorage),
      instance(this.mockCache),
      instance(this.mockLogger)
    )

    // test
    const actual = await getDependencyChanges.execute(
      testProvider,
      testPackageFilePath
    );

    // assert
    assert.equal(actual.length, testNewDependencies.length);
    assert.equal(actual, testNewDependencies);
  }

}