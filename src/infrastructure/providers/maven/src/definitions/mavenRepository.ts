import { UrlHelpers } from "domain/clients"

export type MavenRepository = {
  url: string,
  protocol: UrlHelpers.RegistryProtocols
}
