import assert from 'assert';
import {
  PackageDescriptor,
  TPackagePathDescriptor,
  TPackageTypeDescriptor,
  TPackageVersionDescriptor
} from 'domain/packages';
import { test } from 'mocha-ui-esm';

const testVersionDesc: TPackageVersionDescriptor = {
  type: "version",
  version: "1.0.0",
  versionRange: { start: 2, end: 2 }
}

const testPathDesc: TPackagePathDescriptor = {
  type: "path",
  path: "test/path",
  pathRange: { start: 100, end: 111 }
}

export const PackageDescriptorTests = {

  [test.title]: PackageDescriptor.name,

  addType: {

    "can add $1 types": [
      ["single", [testVersionDesc]],
      ["multiple", [testVersionDesc, testPathDesc]],
      (testTitle: string, testDescriptors: Array<TPackageTypeDescriptor>) => {

        const testPackageDesc = new PackageDescriptor("testName", { start: 1, end: 1 });

        testDescriptors.forEach(x => testPackageDesc.addType(x));

        assert.equal(testPackageDesc.typeCount, testDescriptors.length);

        testDescriptors.forEach(
          x => assert.deepEqual(testPackageDesc.getType(x.type), x)
        );
      }
    ]

  },

  hasType: {

    "returns true for $1 types": [
      ["single", [testVersionDesc]],
      ["multiple", [testVersionDesc, testPathDesc]],
      (testTitle: string, testDescriptors: Array<TPackageTypeDescriptor>) => {

        const testPackageDesc = new PackageDescriptor("testName", { start: 1, end: 1 });

        testDescriptors.forEach(x => testPackageDesc.addType(x));

        testDescriptors.forEach(
          x => assert.ok(testPackageDesc.hasType(x.type))
        );
      }
    ]

  }

}