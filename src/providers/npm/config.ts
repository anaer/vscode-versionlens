import { AbstractProviderConfig } from 'core/configuration/abstractProviderConfig';

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

const options = {
  group: ['tags', 'statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/package.json',
  }
}

export class NpmConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  constructor(provider: string = 'npm') {
    super(provider, options);

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  getDependencyProperties() {
    return this.getContribution(
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.getContribution(
      NpmContributions.DistTagFilter,
      []
    );

  }

}
