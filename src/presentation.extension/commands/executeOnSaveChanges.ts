import { ICache, MemoryCache } from "domain/caching";
import { ILogger } from "domain/logging";
import { PackageDependency, hasPackageDepsChanged } from "domain/packages";
import { IProvider } from "domain/providers";
import { tasks } from "vscode";

export async function executeOnSaveChanges(
  provider: IProvider,
  packagePath: string,
  originalPackagesCache: ICache,
  editedPackagesCache: ICache,
  logger: ILogger
): Promise<void> {

  // create the cache key
  const cacheKey = MemoryCache.createKey(provider.config.providerName, packagePath);

  // get the original opened parsed packages
  const original = originalPackagesCache.get<PackageDependency[]>(cacheKey);

  // get the edited parsed packages
  const edited = editedPackagesCache.get<PackageDependency[]>(cacheKey);

  // test if anything has changed
  if (hasPackageDepsChanged(original, edited)) {

    // update original to edited
    originalPackagesCache.set<PackageDependency[]>(cacheKey, edited);

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
    const filteredTasks = availableTasks.filter(
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

      // prevent a vscode bug that calls this fn mutliple times
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
        originalPackagesCache.set<PackageDependency[]>(cacheKey, original);
      }

    });
  }
}