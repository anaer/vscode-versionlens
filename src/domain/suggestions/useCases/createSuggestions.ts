import { Nullable } from 'domain/generics';
import { VersionUtils } from 'domain/packages';
import semver from 'semver';
import { SuggestionTypes, TPackageSuggestion } from '../index';
import {
  createFixedStatus,
  createLatest,
  createMatchesLatest,
  createNoMatch,
  createSatisifies,
  createSatisifiesLatest
} from '../suggestionFactory';

export function createSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[],
  distTagVersion: Nullable<string> = null
): Array<TPackageSuggestion> {
  const { compareLoose, maxSatisfying, prerelease, valid, validRange } = semver;
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

  if (releases.length === 0 && prereleases.length === 0)
    // no match
    suggestions.push(createNoMatch())
  else if (!satisfiesVersion)
    // no match
    suggestions.push(
      createNoMatch(),
      // suggest latestVersion
      createLatest(latestVersion),
    )
  else if (isLatest && isFixedVersion)
    // latest
    suggestions.push(createMatchesLatest(latestVersion));
  else if (isLatest && isRangeVersion)
    suggestions.push(
      // satisfies latest
      createSatisifiesLatest(latestVersion)
    );
  else if (satisfiesVersion && isFixedVersion)
    suggestions.push(
      // fixed
      createFixedStatus(satisfiesVersion),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion)
    suggestions.push(
      // satisfies version that doesnt match latest
      createSatisifies(satisfiesVersion),
      // suggest latestVersion
      createLatest(latestVersion),
    );

  // roll up prereleases
  const maxSatisfyingPrereleases = VersionUtils.filterPrereleasesGtMinRange(
    versionRange,
    prereleases
  ).sort(compareLoose);

  // group prereleases (latest first)
  const taggedVersions = VersionUtils.extractTaggedVersions(maxSatisfyingPrereleases);
  for (let index = taggedVersions.length - 1; index > -1; index--) {
    const pvn = taggedVersions[index];
    if (pvn.name === 'latest') break;
    if (pvn.version === satisfiesVersion) break;
    if (pvn.version === latestVersion) break;
    if (versionRange.includes(pvn.version)) break;

    suggestions.push({
      name: pvn.name,
      version: pvn.version,
      type: SuggestionTypes.prerelease
    });
  }

  return suggestions;
}