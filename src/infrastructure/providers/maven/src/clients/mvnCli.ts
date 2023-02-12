import { IProcessClient, UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { MavenRepository } from '../definitions/mavenRepository';
import { MavenConfig } from '../mavenConfig';
import * as MavenXmlFactory from '../mavenXmlParserFactory';

export class MvnCli {

  constructor(config: MavenConfig, processClient: IProcessClient, logger: ILogger) {
    this.processClient = processClient;
    this.config = config;
    this.logger = logger;
  }

  config: MavenConfig;

  processClient: IProcessClient;

  logger: ILogger;

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
