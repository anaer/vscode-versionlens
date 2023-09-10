import {
  SuggestionCategory,
  SuggestionStatusText
} from 'domain/suggestions';
import { KeyDictionary } from 'domain/utils';
import {
  SuggestionCodeLens,
  SuggestionCommandContributions
} from 'presentation.extension';

export function createStatusCommand(status: string, codeLens: SuggestionCodeLens) {
  return codeLens.setCommand(status, "");
}

export function createUpdateableCommand(title: string, codeLens: SuggestionCodeLens) {
  return codeLens.setCommand(
    title,
    SuggestionCommandContributions.OnUpdateDependencyClick,
    [codeLens]
  );
}

export function createInvalidCommand(codeLens: SuggestionCodeLens) {
  return codeLens.setCommand(SuggestionStatusText.Invalid, "");
}

export function createDirectoryLinkCommand(title: string, codeLens: SuggestionCodeLens) {
  const cmd = SuggestionCommandContributions.OnFileLinkClick as string;
  return codeLens.setCommand(title, cmd, [codeLens]);
}

export function createSuggestedVersionCommand(
  codeLens: SuggestionCodeLens,
  indicators: KeyDictionary<string>
) {
  if (!codeLens.package.suggestion) return createInvalidCommand(codeLens);

  const { name, version, category } = codeLens.package.suggestion;

  // get the category indicator
  const indicator = indicators[category];
  const indicatedName = indicator
    ? `${indicator}${name}`
    : name;

  // create the indicated command title
  const cmdTitle = `${indicatedName} ${version}`.trim();

  // create the suggestion command
  switch (category) {
    case SuggestionCategory.Updateable:
      createUpdateableCommand(cmdTitle, codeLens)
      break;

    case SuggestionCategory.Directory:
      createDirectoryLinkCommand(cmdTitle, codeLens)
      break;

    default:
      createStatusCommand(cmdTitle.trimEnd(), codeLens)
      break;
  }
}