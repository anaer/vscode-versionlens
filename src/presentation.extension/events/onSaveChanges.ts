import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { VersionLensState } from "presentation.extension";
import { Task, tasks } from "vscode";

export class OnSaveChanges {

  constructor(
    readonly state: VersionLensState,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(provider: ISuggestionProvider, packageFilePath: string): Promise<void> {
    if (this.state.showOutdated.value == false) return;

    // check we have a task to run
    if (provider.config.onSaveChangesTask === null) {
      this.logger.info(
        'Skipping "%s.onSaveChanges" because a custom task was not provided.',
        provider.config.providerName
      );
      return;
    }

    // fetch the custom task for the provider
    const availableTasks = await tasks.fetchTasks();
    const filteredTasks = availableTasks.filter(
      x => x.name == provider.config.onSaveChangesTask
    );

    // check we found a task
    if (filteredTasks.length == 0) {
      this.logger.error(
        'Could not find the %s.onSaveChanges["%s"] task.',
        provider.config.providerName,
        provider.config.onSaveChangesTask
      );
      return;
    }

    this.logger.info(
      'Executing %s.onSaveChanges["%s"] task.',
      provider.config.providerName,
      provider.config.onSaveChangesTask
    );

    // execute the task
    const exitCode = await executeTask(filteredTasks[0])

    // reset outdated flag
    this.state.showOutdated.change(false);

    this.logger.info(
      '%s.onSaveChanges["%s"] task exited with %s.',
      provider.config.providerName,
      provider.config.onSaveChangesTask,
      exitCode
    );
  }

}

async function executeTask(task: Task): Promise<number> {
  await tasks.executeTask(task);
  return new Promise((resolve, reject) => {
    const disposable = tasks.onDidEndTaskProcess(e => {
      if (task.name === e.execution.task.name) {
        disposable.dispose();
        resolve(e.exitCode);
      }
    });
  });
}