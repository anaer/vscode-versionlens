import { SuggestionTypes } from 'domain/suggestions';
import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  SuggestionCodeLens,
  SuggestionCommandContributions,
  SuggestionIndicators
} from 'presentation.extension';

export function createTagCommand(tag: string, codeLens: SuggestionCodeLens) {
  return codeLens.setCommand(tag, "");
}

export function createInvalidCommand(codeLens: SuggestionCodeLens) {
  return codeLens.setCommand("Invalid entry", "");
}

export function createDirectoryLinkCommand(codeLens: SuggestionCodeLens) {
  let title: string;
  let cmd = SuggestionCommandContributions.FileLinkClicked as string;

  const path = codeLens.package.fetchedPackage?.version;
  if (!path) return createInvalidCommand(codeLens);

  const filePath = resolve(
    dirname(codeLens.documentUrl.fsPath),
    path
  );

  const fileExists = fs.existsSync(filePath);
  if (fileExists === false)
    title = (cmd = "") || 'Specified resource does not exist';
  else
    title = `${SuggestionIndicators.OpenNewWindow} ${codeLens.package.parsedPackage.version}`;

  return codeLens.setCommand(title, cmd, [codeLens, filePath]);
}

export function createSuggestedVersionCommand(codeLens: SuggestionCodeLens) {
  if (!codeLens.package.suggestion) return createInvalidCommand(codeLens);

  const { name, version, type } = codeLens.package.suggestion;
  const isStatus = (type & SuggestionTypes.status);
  const isTag = (type & SuggestionTypes.tag);
  const isPrerelease = type & SuggestionTypes.prerelease;

  if (!isStatus) {
    const replaceWithVersion: string = isPrerelease || isTag ?
      version :
      codeLens.replaceVersionFn(codeLens.package, version);

    const prefix = isTag ? '' : name + ': ';
    return codeLens.setCommand(
      `${prefix}${SuggestionIndicators.Update} ${version}`,
      SuggestionCommandContributions.UpdateDependencyClicked,
      [codeLens, `${replaceWithVersion}`]
    );
  }

  // show the status
  return createTagCommand(`${name} ${version}`.trimEnd(), codeLens);
}