import {
  SuggestionCategory,
  SuggestionFactory,
  SuggestionTypes,
  TPackageSuggestion,
  VersionUtils
} from 'domain/packages';
import { Nullable } from 'domain/utils';
import semver from 'semver';

export function createSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[],
  distTagVersion: Nullable<string> = null
): Array<TPackageSuggestion> {
  const { compareLoose, maxSatisfying, prerelease, valid, validRange, gt, minVersion } = semver;
  const suggestions: Array<TPackageSuggestion> = [];

  const isFixedVersion = valid(versionRange);
  const isRangeVersion = validRange(versionRange);
  const isPreRelease = prerelease(versionRange)

  // check for a release
  let satisfiesVersion = maxSatisfying(
    releases,
    versionRange,
    VersionUtils.loosePrereleases
  );

  if (!satisfiesVersion && isPreRelease) {
    // lookup prereleases
    satisfiesVersion = maxSatisfying(
      prereleases,
      versionRange,
      VersionUtils.loosePrereleases
    );
  }

  // get the latest release
  const latestVersion = distTagVersion || releases[releases.length - 1];
  const isLatest = latestVersion === satisfiesVersion;

  let hasRangeUpdate = false;

  if (isRangeVersion && satisfiesVersion) {
    // get the lowest version in the range
    const lowestRangeVersion = minVersion(versionRange);
    // check satisfiesVersion > minRangeVersion
    hasRangeUpdate = gt(satisfiesVersion, lowestRangeVersion, compareLoose);
  }

  if (releases.length === 0 && prereleases.length === 0)
    // no match
    suggestions.push(SuggestionFactory.createNoMatchStatus())
  else if (!satisfiesVersion)
    // no match
    suggestions.push(
      SuggestionFactory.createNoMatchStatus(),
      // suggest latestVersion
      SuggestionFactory.createLatestUpdateable(latestVersion),
    )
  else if (isLatest && isFixedVersion)
    // latest
    suggestions.push(SuggestionFactory.createMatchesLatestStatus(latestVersion));
  else if (isLatest && isRangeVersion && hasRangeUpdate)
    suggestions.push(
      // satisfies latest
      SuggestionFactory.createSatisifiesLatestStatus(latestVersion),
      // suggest latestVersion
      SuggestionFactory.createLatestUpdateable(latestVersion),
    );
  else if (isLatest && isRangeVersion)
    suggestions.push(
      // matches latest
      SuggestionFactory.createMatchesLatestStatus(latestVersion)
    );
  else if (satisfiesVersion && isFixedVersion)
    suggestions.push(
      // fixed
      SuggestionFactory.createFixedStatus(satisfiesVersion),
      // suggest latestVersion
      SuggestionFactory.createLatestUpdateable(latestVersion),
    );
  else if (hasRangeUpdate) {
    suggestions.push(
      // satisfies version that doesnt match latest
      SuggestionFactory.createSatisifiesStatus(satisfiesVersion),
      // suggest update
      SuggestionFactory.createRangeUpdateable(satisfiesVersion),
    );
  }
  else if (satisfiesVersion)
    suggestions.push(
      // satisfies version that doesnt match latest
      SuggestionFactory.createSatisifiesStatus(satisfiesVersion),
      // suggest latestVersion
      SuggestionFactory.createLatestUpdateable(latestVersion),
    );

  // roll up prereleases
  const maxSatisfyingPrereleases = VersionUtils.filterPrereleasesGtMinRange(
    versionRange,
    prereleases
  ).sort(compareLoose);

  // group prereleases (latest first)
  const taggedVersions = VersionUtils.extractTaggedVersions(maxSatisfyingPrereleases);
  for (let index = taggedVersions.length - 1; index > -1; index--) {
    const tv = taggedVersions[index];
    if (tv.name === 'latest') break;
    if (tv.version === satisfiesVersion) break;
    if (tv.version === latestVersion) break;
    if (versionRange.includes(tv.version)) break;

    suggestions.push({
      name: tv.name,
      category: SuggestionCategory.Updateable,
      version: tv.version,
      type: SuggestionTypes.prerelease
    });
  }

  return suggestions;
}