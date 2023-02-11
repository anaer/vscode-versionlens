import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export type TPackageTypeHandler = (
  valueNode: any,
  isQuoteType: boolean
) => TPackageTypeDescriptor;