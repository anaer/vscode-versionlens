import assert from "assert";
import { CachingOptions } from "domain/caching";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageResponse } from "domain/packages";
import { IProviderConfig } from "domain/providers";
import { ISuggestionProvider, SuggestionTypes } from "domain/suggestions";
import { FetchProjectSuggestions, GetSuggestions } from "domain/useCases";
import { test } from "mocha-ui-esm";
import { anything, instance, mock, verify, when } from "ts-mockito";

type TestContext = {
  mockEditorDependencyCache: DependencyCache;
  mockFileDependencyCache: DependencyCache;
  mockLogger: ILogger;
  mockConfig: IProviderConfig;
  mockProvider: ISuggestionProvider;
  mockCachingOpts: CachingOptions;
  mockFetchProjectSuggestions: FetchProjectSuggestions;
}

export const getSuggestionsTests = {

  [test.title]: GetSuggestions.name,

  beforeEach: function (this: TestContext) {
    this.mockEditorDependencyCache = mock<DependencyCache>();
    this.mockFileDependencyCache = mock<DependencyCache>();
    this.mockCachingOpts = mock<CachingOptions>();
    this.mockConfig = mock<IProviderConfig>()
    this.mockLogger = mock<ILogger>();
    this.mockProvider = mock<ISuggestionProvider>();
    this.mockFetchProjectSuggestions = mock<FetchProjectSuggestions>();
  },

  "$i: return expected suggestions.length==$3 and includePrereleases==$2": [
    [[], false, 0],
    [
      [
        <PackageResponse>{
          parsedPackage: {
            name: "test-package",
            version: "1.2.3",
            path: "some/project/path/package.json"
          },
          suggestion: {
            name: "test-package",
            version: "1.2.4",
            type: SuggestionTypes.release
          }
        }
      ],
      false,
      1
    ],
    [
      [
        <PackageResponse>{
          parsedPackage: {
            name: "test-package",
            version: "1.2.3",
            path: "some/project/path/package.json"
          },
          suggestion: {
            name: "test-package",
            version: "1.2.4",
            type: SuggestionTypes.prerelease
          }
        }
      ],
      true,
      1
    ],
    async function (
      this: TestContext,
      testSuggestions: PackageResponse[],
      testIncludePrereleases: boolean,
      expectedLength: number
    ) {
      const testCacheOpts = instance(this.mockCachingOpts)
      const testProvider = instance(this.mockProvider)
      const testProjectPath = "some/project/path";
      const testPackageFilePath = `${testProjectPath}/package.json`;

      when(this.mockCachingOpts.duration).thenReturn(3000)
      when(this.mockConfig.caching).thenReturn(testCacheOpts);
      when(this.mockProvider.name).thenReturn("test provider");
      when(this.mockProvider.config).thenReturn(instance(this.mockConfig));
      when(this.mockFetchProjectSuggestions.execute(testProvider, testProjectPath, testProjectPath, anything()))
        .thenResolve(testSuggestions);

      when(this.mockEditorDependencyCache.get(testProvider.name, testPackageFilePath))
        .thenReturn([]);

      when(this.mockFileDependencyCache.get(testProvider.name, testPackageFilePath))
        .thenReturn([]);

      const useCase = new GetSuggestions(
        instance(this.mockFetchProjectSuggestions),
        [instance(this.mockEditorDependencyCache), instance(this.mockFileDependencyCache)],
        instance(this.mockLogger)
      );

      // test
      const actualSuggestions = await useCase.execute(
        instance(this.mockProvider),
        testProjectPath,
        testPackageFilePath,
        testIncludePrereleases
      );

      // verify
      verify(this.mockCachingOpts.defrost()).once()

      verify(
        this.mockLogger.debug(
          "caching duration is set to %s seconds",
          testCacheOpts.duration / 1000
        )
      ).once();

      verify(
        this.mockEditorDependencyCache.get(
          testProvider.name,
          testPackageFilePath
        )
      ).once();

      verify(
        this.mockFileDependencyCache.get(
          testProvider.name,
          testPackageFilePath
        )
      ).never();

      verify(
        this.mockLogger.info(
          "resolved %s %s package release and pre-release suggestions",
          expectedLength,
          testProvider.name
        )
      ).once();

      // assert
      assert.equal(actualSuggestions.length, expectedLength);
    }
  ]

}