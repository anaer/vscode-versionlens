import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IJsonHttpClient
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import { DotNetSource } from '../definitions/dotnet';
import { NugetServiceIndexResponse } from '../definitions/nuget';

export class NuGetResourceClient {

  logger: any;

  jsonClient: IJsonHttpClient;

  constructor(client: IJsonHttpClient, logger: ILogger) {
    this.jsonClient = client;
    this.logger = logger;
  }

  async fetchResource(source: DotNetSource): Promise<string> {
    const query = {};
    const headers = {};

    this.logger.debug("Requesting PackageBaseAddressService from %s", source.url)

    try {
      const response = await this.jsonClient.request(
        HttpClientRequestMethods.get,
        source.url,
        query,
        headers
      ) as NugetServiceIndexResponse;

      const packageBaseAddressServices = response.data.resources
        .filter(res => res["@type"].indexOf('PackageBaseAddress') > -1);

      // just take one service for now
      const foundPackageBaseAddressServices = packageBaseAddressServices[0]["@id"];

      this.logger.debug(
        "Resolved PackageBaseAddressService endpoint: %O",
        foundPackageBaseAddressServices
      );

      return foundPackageBaseAddressServices;
    }
    catch (error) {
      const responseError = error as HttpClientResponse;
      this.logger.error(
        "Could not resolve nuget service index. %O",
        responseError
      )
      return "";
    }
  }

}