import { throwUndefinedOrNull } from '@esm-test/guards';
import { IProcessClient, UrlUtils } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { MavenRepository } from '../definitions/mavenRepository';
import { MavenConfig } from '../mavenConfig';
import { extractReposUrlsFromXml } from '../parser/mavenXmlUtils';

export class MvnCli {

  constructor(
    readonly config: MavenConfig, 
    readonly processClient: IProcessClient, 
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("processClient", processClient);
    throwUndefinedOrNull("logger", logger);
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

      repos = extractReposUrlsFromXml(data);

    } catch (err) {
      repos = [];
    }

    if (repos.length === 0) {
      // this.config.getDefaultRepository()
      repos.push("https://repo.maven.apache.org/maven2/");
    }

    // parse urls to Array<MavenRepository>
    return repos.map(url => {
      const protocol = UrlUtils.getProtocolFromUrl(url);
      return {
        url,
        protocol,
      };
    });
  }

}
