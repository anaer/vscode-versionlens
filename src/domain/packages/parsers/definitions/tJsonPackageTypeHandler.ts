import * as JsonC from 'jsonc-parser';
import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export type TJsonPackageTypeHandler = (valueNode: JsonC.Node) => TPackageTypeDescriptor;