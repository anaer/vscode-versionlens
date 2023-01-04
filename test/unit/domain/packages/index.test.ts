// VersionHelperTests
import extractTaggedVersions from './versionHelpers/extractTaggedVersions.tests';
import rollupPrereleases from './versionHelpers/filterPrereleasesGtMinRange.tests';
import splitReleasesFromArray from './versionHelpers/splitReleasesFromArray.tests';
import removeFourSegmentVersionsFromArray from './versionHelpers/removeFourSegmentVersionsFromArray.tests';
import friendlifyPrereleaseName from './versionHelpers/friendlifyPrereleaseName.tests';
import filterSemverVersions from './versionHelpers/filterSemverVersions.tests';
import isFixedVersion from './versionHelpers/isFixedVersion.tests';
import lteFromArray from './versionHelpers/lteFromArray.tests'

export const VersionHelperTests = {
  extractTaggedVersions,
  rollupPrereleases,
  splitReleasesFromArray,
  removeFourSegmentVersionsFromArray,
  friendlifyPrereleaseName,
  filterSemverVersions,
  isFixedVersion,
  lteFromArray,
}

// Package Parser Tests
import extractPackageDependenciesFromJson from './parsers/jsonPackageParser/extractPackageDependenciesFromJson.tests';
import extractPackageDependenciesFromYaml from './parsers/yamlPackageParser/extractPackageDependenciesFromYaml.tests';

export const PackageParserTests = {
  extractPackageDependenciesFromJson,
  extractPackageDependenciesFromYaml,
}
