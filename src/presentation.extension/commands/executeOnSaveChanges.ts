import { ILogger } from "domain/logging";
import { hasPackageDepsChanged } from "domain/packages";
import { IProvider } from "domain/providers";
import { VersionLensState } from "presentation.extension";
import { tasks } from "vscode";

export async function executeOnSaveChanges(
  provider: IProvider,
  packagePath: string,
  state: VersionLensState,
  logger: ILogger
): Promise<void> {

  // get the original opened parsed packages
  const original = state.getOriginalParsedPackages(
    provider.config.providerName,
    packagePath
  );

  // get the edited parsed packages
  const edited = state.getEditedParsedPackages(
    provider.config.providerName,
    packagePath
  );

  // test if anything has changed
  if (hasPackageDepsChanged(original, edited)) {

    // update original to edited
    state.setOriginalParsedPackages(
      provider.config.providerName,
      packagePath,
      edited
    );

    // check we have a task to run
    if (provider.config.onSaveChangesTask === null) {
      logger.info(
        'Skipping "%s.onSaveChanges" because a custom task was not provided.',
        provider.config.providerName
      );
      return;
    }

    // fetch the custom task for the provider
    const availableTasks = await tasks.fetchTasks();
    const filteredTasks = availableTasks.filter
    (
      x => x.name == provider.config.onSaveChangesTask
    );

    if (filteredTasks.length == 0) {
      logger.error(
        'Could not find the %s.onSaveChanges["%s"] task.',
        provider.config.providerName,
        provider.config.onSaveChangesTask
      );
      return;
    }

    logger.info(
      'Executing %s.onSaveChanges["%s"] task.',
      provider.config.providerName,
      provider.config.onSaveChangesTask
    );

    // execute the task
    await tasks.executeTask(filteredTasks[0]);

    // listen for the end task event
    let endEventCalled = false;
    tasks.onDidEndTaskProcess(e => {
      // prevent a bug that calls this mutliple times
      if (endEventCalled) return;
      endEventCalled = true;

      logger.info(
        '%s.onSaveChanges["%s"] task exited with %s.',
        provider.config.providerName,
        provider.config.onSaveChangesTask,
        e.exitCode
      );

      if (e.exitCode !== 0) {
        logger.info(
          'Reverting the original parsed packages state.',
          provider.config.providerName,
          provider.config.onSaveChangesTask,
          e.exitCode
        );

        // revert original parsed packages state
        state.setOriginalParsedPackages(
          provider.config.providerName,
          packagePath,
          original
        );
      }

    });
  }
}