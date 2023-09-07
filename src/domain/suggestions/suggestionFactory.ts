import { Nullable } from 'domain/generics';
import {
  SuggestionFactory,
  SuggestionStatus,
  SuggestionTypes,
  TPackageSuggestion
} from 'domain/suggestions';
import semver from 'semver';

export function createFromHttpStatus(status: number | string): Nullable<TPackageSuggestion> {

  if (status == 400)
    return SuggestionFactory.createBadRequest();
  else if (status == 401)
    return SuggestionFactory.createNotAuthorized();
  else if (status == 403)
    return SuggestionFactory.createForbidden();
  else if (status == 404)
    return SuggestionFactory.createNotFound();
  else if (status == 500)
    return SuggestionFactory.createInternalServerError();

  return null;
}

export function createNotFound(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NotFound,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createInternalServerError(): TPackageSuggestion {
  return {
    name: SuggestionStatus.InternalServerError,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createConnectionRefused(): TPackageSuggestion {
  return {
    name: SuggestionStatus.ConnectionRefused,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createConnectionReset(): TPackageSuggestion {
  return {
    name: SuggestionStatus.ConnectionReset,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createForbidden(): TPackageSuggestion {
  return {
    name: SuggestionStatus.Forbidden,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createNotAuthorized(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NotAuthorized,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createBadRequest(): TPackageSuggestion {
  return {
    name: SuggestionStatus.BadRequest,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createInvalid(requestedVersion: string): TPackageSuggestion {
  return {
    name: SuggestionStatus.Invalid,
    version: requestedVersion,
    type: SuggestionTypes.status
  };
}

export function createNotSupported(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NotSupported,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createNoMatch(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NoMatch,
    version: '',
    type: SuggestionTypes.status
  };
}

export function createLatest(requestedVersion?: string): TPackageSuggestion {
  const isPrerelease = semver.prerelease(requestedVersion);

  const name = isPrerelease ?
    SuggestionStatus.LatestIsPrerelease :
    SuggestionStatus.Latest;

  // treats requestedVersion as latest version
  // if no requestedVersion then uses the 'latest' tag instead
  return {
    name,
    version: requestedVersion || 'latest',
    type: isPrerelease
      ? SuggestionTypes.prerelease
      : requestedVersion
        ? SuggestionTypes.release
        : SuggestionTypes.tag
  };
}

export function createMatchesLatest(latestVersion: string): TPackageSuggestion {
  const isPrerelease = semver.prerelease(latestVersion);

  const name = isPrerelease ?
    SuggestionStatus.LatestIsPrerelease :
    SuggestionStatus.Latest;

  return {
    name,
    version: latestVersion,
    type: SuggestionTypes.status
  };
}

export function createSatisifiesLatest(latestVersion: string): TPackageSuggestion {
  return createSuggestion(
    SuggestionStatus.SatisfiesLatest,
    latestVersion,
    SuggestionTypes.status
  )
}

export function createSatisifies(satisfiesVersion: string): TPackageSuggestion {
  return createSuggestion(
    SuggestionStatus.Satisfies,
    satisfiesVersion,
    SuggestionTypes.status
  )
}

export function createFixedStatus(version: string): TPackageSuggestion {
  return createSuggestion(
    SuggestionStatus.Fixed,
    version,
    SuggestionTypes.status
  );
}

export function createSuggestion(
  name: string,
  version: string,
  type: SuggestionTypes
): TPackageSuggestion {
  return { name, version, type };
}