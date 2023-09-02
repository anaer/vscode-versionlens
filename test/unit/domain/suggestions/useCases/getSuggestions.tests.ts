import assert from "assert";
import { CachingOptions } from "domain/caching";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageResponse } from "domain/packages";
import { IProviderConfig } from "domain/providers";
import { GetSuggestions, ISuggestionProvider } from "domain/suggestions";
import { test } from "mocha-ui-esm";
import { anything, instance, mock, verify, when } from "ts-mockito";

export const getSuggestionsTests = {

  [test.title]: GetSuggestions.name,

  "$i: return expected suggestions": [
    [[], 0,],
    [
      [
        <PackageResponse>{
          parsedPackage: {
            name: "test-package",
            version: "1.2.3",
            path: "some/project/path/package.json"
          }
        }
      ],
      1
    ],
    async function (testSuggestions: PackageResponse[], expectedLength: number) {
      const mockDefaultDependencyCache = mock<DependencyCache>();
      const mockDependencyCache = mock<DependencyCache>();
      const mockLogger = mock<ILogger>();
      const mockConfig = mock<IProviderConfig>()
      const mockProvider = mock<ISuggestionProvider>();
      const mockCachingOpts = mock<CachingOptions>();

      const testCacheOpts = instance(mockCachingOpts)
      const testProvider = instance(mockProvider)
      const testProjectPath = "some/project/path";
      const testPackageFilePath = `${testProjectPath}/package.json`;

      when(mockCachingOpts.duration).thenReturn(3000)
      when(mockConfig.caching).thenReturn(testCacheOpts);
      when(mockProvider.name).thenReturn("test provider");
      when(mockProvider.config).thenReturn(instance(mockConfig));
      when(mockProvider.fetchSuggestions(testProjectPath, testProjectPath, anything()))
        .thenResolve(testSuggestions);

      when(mockDefaultDependencyCache.get(testProvider.name, testPackageFilePath))
        .thenReturn([]);

      when(mockDependencyCache.get(testProvider.name, testPackageFilePath))
        .thenReturn([]);

      const useCase = new GetSuggestions(
        instance(mockDependencyCache),
        instance(mockLogger)
      );

      // test
      const actualSuggestions = await useCase.execute(
        instance(mockProvider),
        testProjectPath,
        testPackageFilePath,
        instance(mockDefaultDependencyCache)
      );

      // verify
      verify(mockCachingOpts.defrost()).once()

      verify(
        mockLogger.debug(
          "caching duration is set to %s seconds",
          testCacheOpts.duration / 1000
        )
      ).once();

      verify(
        mockDefaultDependencyCache.get(
          testProvider.name,
          testPackageFilePath
        )
      ).once();

      verify(
        mockDependencyCache.get(
          testProvider.name,
          testPackageFilePath
        )
      ).never();

      verify(
        mockLogger.info(
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