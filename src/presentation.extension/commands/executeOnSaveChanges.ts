import { ILogger } from "domain/logging";
import { IProvider } from "domain/providers";
import { tasks } from "vscode";

export async function executeOnSaveChanges(provider: IProvider, logger: ILogger): Promise<boolean> {
  // check we have a task to run
  if (provider.config.onSaveChangesTask === null) {
    logger.info(
      'Skipping "%s.onSaveChanges" because a custom task was not provided.',
      provider.config.providerName
    );
    return true;
  }

  // fetch the custom task for the provider
  const availableTasks = await tasks.fetchTasks();
  const filteredTasks = availableTasks.filter(
    x => x.name == provider.config.onSaveChangesTask
  );

  // check we found a task
  if (filteredTasks.length == 0) {
    logger.error(
      'Could not find the %s.onSaveChanges["%s"] task.',
      provider.config.providerName,
      provider.config.onSaveChangesTask
    );
    return false;
  }

  logger.info(
    'Executing %s.onSaveChanges["%s"] task.',
    provider.config.providerName,
    provider.config.onSaveChangesTask
  );

  // execute the task
  await tasks.executeTask(filteredTasks[0]);

  // listen for the end task event
  let exitCode = 0;
  const disposable = tasks.onDidEndTaskProcess(e => {
    logger.info(
      '%s.onSaveChanges["%s"] task exited with %s.',
      provider.config.providerName,
      provider.config.onSaveChangesTask,
      e.exitCode
    );

    exitCode = e.exitCode;
  });

  // prevent vscode calling onDidEndTaskProcess mutliple times
  disposable.dispose();

  // check the install was successful
  if (exitCode !== 0) {
    logger.info('Reverting the original parsed packages state.');
    return false;
  }

  // return success
  return true;
}