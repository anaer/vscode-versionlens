import { VersionUtils } from 'domain/packages';
import semver from 'semver';
import { SuggestionFlags, SuggestionStatus, TPackageSuggestion } from './index';
import {
  createFixedStatus,
  createLatest,
  createMatchesLatest,
  createNoMatch,
  createSatisifiesLatest,
  createSuggestion
} from './suggestionFactory';

export function createSuggestions(
  versionRange: string,
  releases: string[],
  prereleases: string[],
  suggestedLatestVersion: string = null
): Array<TPackageSuggestion> {
  const { maxSatisfying, compareLoose } = semver;
  const suggestions: Array<TPackageSuggestion> = [];

  // check for a release
  let satisfiesVersion = maxSatisfying(
    releases,
    versionRange,
    VersionUtils.loosePrereleases
  );
  if (!satisfiesVersion && versionRange.indexOf('-') > -1) {
    // lookup prereleases
    satisfiesVersion = maxSatisfying(
      prereleases,
      versionRange,
      VersionUtils.loosePrereleases
    );
  }

  // get the latest release
  const latestVersion = suggestedLatestVersion || releases[releases.length - 1];
  const isLatest = latestVersion === satisfiesVersion;

  const noSuggestionNeeded = versionRange.includes(satisfiesVersion) ||
    versionRange.includes(suggestedLatestVersion);

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
  else if (isLatest && noSuggestionNeeded)
    // latest
    suggestions.push(createMatchesLatest(versionRange));
  else if (isLatest)
    suggestions.push(
      // satisfies latest
      createSatisifiesLatest(),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion && VersionUtils.isFixedVersion(versionRange))
    suggestions.push(
      // fixed
      createFixedStatus(versionRange),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion)
    suggestions.push(
      // satisfies >x.y.z <x.y.z
      createSuggestion(
        SuggestionStatus.Satisfies,
        satisfiesVersion,
        noSuggestionNeeded ?
          SuggestionFlags.status :
          SuggestionFlags.release
      ),
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
      flags: SuggestionFlags.prerelease
    });
  }

  return suggestions;
}
