import { ILogger } from 'domain/logging';
import { UrlHelpers, IProcessClient } from 'domain/clients';
import { DotNetSource } from '../definitions/dotnet';
import { DotNetConfig } from '../dotnetConfig';
import { CrLf, Lf } from 'domain/utils';

export class DotNetCli {

  constructor(config: DotNetConfig, client: IProcessClient, logger: ILogger) {
    this.config = config;
    this.processClient = client;
    this.logger = logger;
  }

  config: DotNetConfig;

  processClient: IProcessClient;

  logger: ILogger;

  async fetchSources(cwd: string): Promise<Array<DotNetSource>> {
    try {
      const result = await this.processClient.request(
        'dotnet',
        ['nuget', 'list', 'source', '--format', 'short'],
        cwd
      );

      const { data } = result;

      // reject when data contains "error"
      if (data.indexOf("error") > -1) return Promise.reject(result);

      // check we have some data
      if (data.length === 0 || data.indexOf('E') === -1) {
        return [];
      }

      // extract sources
      const hasCrLf = data.indexOf(CrLf) > 0;
      const splitChar = hasCrLf ? CrLf : Lf;
      let lines = data.split(splitChar);

      // pop any blank entries
      if (lines[lines.length - 1] === '') lines.pop();

      // parse the sources
      const sources = parseSourcesArray(lines).filter(s => s.enabled);

      // combine the sources where user feed settings takes precedent
      const feedSources = convertFeedsToSources(this.config.nuget.sources);
      const combinedSources = [
        ...feedSources,
        ...sources
      ];

      // log combinedSources for diagnostics
      this.logger.debug(
        "package sources found: %s",
        combinedSources.map(x => x.url)
      )

      return combinedSources;

    } catch (error) {
      this.logger.error(
        "failed to get package sources: %s",
        error
      )

      this.logger.info(
        "using fallback source: %s",
        this.config.fallbackNugetSource
      )

      // return the fallback source for dotnet clients < 5.5
      return [
        <DotNetSource>{
          enabled: true,
          machineWide: false,
          protocol: UrlHelpers.RegistryProtocols.https,
          url: this.config.fallbackNugetSource,
        }
      ]
    }
  }
}

function parseSourcesArray(lines: Array<string>): Array<DotNetSource> {
  return lines.map(function (line) {
    const enabled = line.substring(0, 1) === 'E';
    const machineWide = line.substring(1, 2) === 'M';
    const offset = machineWide ? 3 : 2;
    const url = line.substring(offset);
    const protocol = UrlHelpers.getProtocolFromUrl(url);
    return {
      enabled,
      machineWide,
      url,
      protocol
    };
  });
}

function convertFeedsToSources(feeds: Array<string>): Array<DotNetSource> {
  return feeds.map(function (url: string) {
    const protocol = UrlHelpers.getProtocolFromUrl(url);
    const machineWide = (protocol === UrlHelpers.RegistryProtocols.file);
    return {
      enabled: true,
      machineWide,
      url,
      protocol
    };
  });
}
