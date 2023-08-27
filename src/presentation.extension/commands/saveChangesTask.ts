import { throwNull, throwUndefined } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { IPackageDependencyWatcher, PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";
import { Task, tasks } from "vscode";

export class SaveChangesTask {

  constructor(
    readonly packageDependencyWatcher: IPackageDependencyWatcher,
    readonly logger: ILogger
  ) {
    throwUndefined("packageDependencyWatcher", packageDependencyWatcher);
    throwNull("packageDependencyWatcher", packageDependencyWatcher);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // run execute when a change is detected
    packageDependencyWatcher.registerOnPackageFileChanged(this.execute.bind(this));
  }

  async execute(provider: ISuggestionProvider, packageDeps: PackageDependency[]): Promise<boolean> {

    // check we have a task to run
    if (provider.config.onSaveChangesTask === null) {
      this.logger.info(
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
      this.logger.error(
        'Could not find the %s.onSaveChanges["%s"] task.',
        provider.config.providerName,
        provider.config.onSaveChangesTask
      );
      return false;
    }

    this.logger.info(
      'Executing %s.onSaveChanges["%s"] task.',
      provider.config.providerName,
      provider.config.onSaveChangesTask
    );

    // execute the task
    const exitCode = await executeTask(filteredTasks[0])

    this.logger.info(
      '%s.onSaveChanges["%s"] task exited with %s.',
      provider.config.providerName,
      provider.config.onSaveChangesTask,
      exitCode
    );

    // check the install was successful
    if (exitCode !== 0) {
      this.logger.info('Reverting the original parsed packages state.');
      return false;
    }

    // return success
    return true;
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