import { hasPackageDepsChanged } from "application/packages";
import { ILogger } from "domain/logging";
import { IProvider } from "domain/providers";
import { VersionLensState } from "presentation.extension";
import { commands } from "vscode";

export async function executeOnSaveChanges(
  provider: IProvider,
  packagePath: string,
  state: VersionLensState,
  logger: ILogger
): Promise<void> {
  // get the original and recent parsed packages
  const original = state.getOriginalParsedPackages(
    provider.config.providerName,
    packagePath
  );

  const recent = state.getRecentParsedPackages(
    provider.config.providerName,
    packagePath
  );

  // test if anything has changed
  if (hasPackageDepsChanged(original, recent)) {

    // set original to recent
    state.setOriginalParsedPackages(
      provider.config.providerName,
      packagePath,
      recent
    );

    // check we have a task to run
    if (provider.config.onSaveChangesTask === null) {
      logger.info(
        'Skipping "%s.onSaveChanges" because the custom task is set to default.',
        provider.config.providerName
      );
      return;
    }

    logger.info(
      'Executing task "%s" for "%s.onSaveChanges"',
      provider.config.providerName,
      provider.config.onSaveChangesTask
    );

    // run the custom task for the provider
    const exitCode = await commands.executeCommand(
      "workbench.action.tasks.runTask",
      provider.config.onSaveChangesTask
    )

    logger.info(
      'Task "%s"for "%s.onSaveChanges" exited with %s',
      provider.config.providerName,
      provider.config.onSaveChangesTask,
      exitCode
    );
  }
}