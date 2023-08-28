import { Nullable } from 'domain/generics';
import {
  SuggestionFactory,
  SuggestionFlags,
  SuggestionStatus,
  TPackageSuggestion
} from 'domain/suggestions';

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
    flags: SuggestionFlags.status
  };
}

export function createInternalServerError(): TPackageSuggestion {
  return {
    name: SuggestionStatus.InternalServerError,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createConnectionRefused(): TPackageSuggestion {
  return {
    name: SuggestionStatus.ConnectionRefused,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createConnectionReset(): TPackageSuggestion {
  return {
    name: SuggestionStatus.ConnectionReset,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createForbidden(): TPackageSuggestion {
  return {
    name: SuggestionStatus.Forbidden,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createNotAuthorized(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NotAuthorized,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createBadRequest(): TPackageSuggestion {
  return {
    name: SuggestionStatus.BadRequest,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createInvalid(requestedVersion: string): TPackageSuggestion {
  return {
    name: SuggestionStatus.Invalid,
    version: requestedVersion,
    flags: SuggestionFlags.status
  };
}

export function createNotSupported(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NotSupported,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createNoMatch(): TPackageSuggestion {
  return {
    name: SuggestionStatus.NoMatch,
    version: '',
    flags: SuggestionFlags.status
  };
}

export function createLatest(requestedVersion?: string): TPackageSuggestion {
  const isPrerelease = requestedVersion && requestedVersion.indexOf('-') !== -1;

  const name = isPrerelease ?
    SuggestionStatus.LatestIsPrerelease :
    SuggestionStatus.Latest;

  // treats requestedVersion as latest version
  // if no requestedVersion then uses the 'latest' tag instead
  return {
    name,
    version: requestedVersion || 'latest',
    flags: isPrerelease
      ? SuggestionFlags.prerelease
      : requestedVersion
        ? SuggestionFlags.release
        : SuggestionFlags.tag
  };
}

export function createMatchesLatest(latestVersion: string): TPackageSuggestion {
  const isPrerelease = latestVersion && latestVersion.indexOf('-') !== -1;

  const name = isPrerelease ?
    SuggestionStatus.LatestIsPrerelease :
    SuggestionStatus.Latest;

  return {
    name,
    version: isPrerelease ? latestVersion : '',
    flags: SuggestionFlags.status
  };
}

export function createSatisifiesLatest(): TPackageSuggestion {
  return createSuggestion(
    SuggestionStatus.Satisfies,
    'latest',
    SuggestionFlags.status
  )
}

export function createFixedStatus(version: string): TPackageSuggestion {
  return createSuggestion(
    SuggestionStatus.Fixed,
    version,
    SuggestionFlags.status
  );
}

export function createSuggestion(
  name: string,
  version: string,
  flags: SuggestionFlags
): TPackageSuggestion {
  return { name, version, flags };
}