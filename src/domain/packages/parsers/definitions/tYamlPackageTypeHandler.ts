import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export type TYamlPackageTypeHandler = (
  valueNode: any,
  isQuoteType: boolean
) => TPackageTypeDescriptor;