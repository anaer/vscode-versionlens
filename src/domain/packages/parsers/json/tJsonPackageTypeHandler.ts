import { TPackageTypeDescriptor } from 'domain/packages';
import * as JsonC from 'jsonc-parser';

export type TJsonPackageTypeHandler = (valueNode: JsonC.Node) => TPackageTypeDescriptor;