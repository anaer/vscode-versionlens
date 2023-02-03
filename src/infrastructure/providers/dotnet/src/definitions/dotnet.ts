import { PackageVersionType } from 'domain/packages';
import { UrlHelpers } from 'domain/clients';
import { NugetVersionSpec } from './nuget';

export type DotNetVersionSpec = {
  type: PackageVersionType,
  rawVersion: string,
  resolvedVersion: string,
  spec: NugetVersionSpec,
};

export type DotNetSource = {
  enabled: boolean,
  machineWide: boolean,
  url: string,
  protocol: UrlHelpers.RegistryProtocols,
}