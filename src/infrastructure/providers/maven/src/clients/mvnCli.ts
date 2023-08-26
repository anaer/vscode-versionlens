import { throwNull, throwUndefined } from '@esm-test/guards';
import { IProcessClient, UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { MavenRepository } from '../definitions/mavenRepository';
import { MavenConfig } from '../mavenConfig';
import * as MavenXmlFactory from '../mavenXmlParserFactory';

export class MvnCli {

  constructor(
    readonly config: MavenConfig, 
    readonly processClient: IProcessClient, 
    readonly logger: ILogger
  ) {
    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("processClient", processClient);
    throwNull("processClient", processClient);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  async fetchRepositories(cwd: string): Promise<Array<MavenRepository>> {
    let repos: Array<string>;

    try {
      const result = await this.processClient.request(
        'mvn ',
        ['help:effective-settings'],
        cwd
      );

      const { data } = result;
      if (data.length === 0) return [];

      repos = MavenXmlFactory.extractReposUrlsFromXml(data);

    } catch (err) {
      repos = [];
    }

    if (repos.length === 0) {
      // this.config.getDefaultRepository()
      repos.push("https://repo.maven.apache.org/maven2/");
    }

    // parse urls to Array<MavenRepository>
    return repos.map(url => {
      const protocol = UrlHelpers.getProtocolFromUrl(url);
      return {
        url,
        protocol,
      };
    });
  }

}
