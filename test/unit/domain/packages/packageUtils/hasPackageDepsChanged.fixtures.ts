import {
  createDependencyRange,
  createPackageResource,
  PackageDependency
} from "domain/packages";

export default {
  single: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(0, 1),
      // versionRange
      createDependencyRange(2, 3)
    )
  ],
  singleWithDiffVersion: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.1.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(0, 1),
      // versionRange
      createDependencyRange(2, 3)
    )
  ],
  singleWithDiffNameRange: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(4, 5),
      // versionRange
      createDependencyRange(2, 3)
    )
  ],
  singleWithDiffVersionRange: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(0, 1),
      // versionRange
      createDependencyRange(4, 5)
    )
  ],
  multiple: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(4, 5),
      // versionRange
      createDependencyRange(6, 7)
    ),
    new PackageDependency(
      createPackageResource(
        "testPackage2",
        "2.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(8, 9),
      // versionRange
      createDependencyRange(10, 11)
    )
  ],
  multipleWithDiffVersion: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(4, 5),
      // versionRange
      createDependencyRange(6, 7)
    ),
    new PackageDependency(
      createPackageResource(
        "testPackage2",
        "2.1.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(8, 9),
      // versionRange
      createDependencyRange(10, 11)
    )
  ],
  multipleWithDiffNameRange: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(4, 5),
      // versionRange
      createDependencyRange(6, 7)
    ),
    new PackageDependency(
      createPackageResource(
        "testPackage2",
        "2.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(12, 13),
      // versionRange
      createDependencyRange(10, 11)
    )
  ],  
  multipleWithDiffVersionRange: [
    new PackageDependency(
      createPackageResource(
        "testPackage1",
        "1.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(4, 5),
      // versionRange
      createDependencyRange(12, 13)
    ),
    new PackageDependency(
      createPackageResource(
        "testPackage2",
        "2.0.0",
        "test/path"
      ),
      //nameRange
      createDependencyRange(8, 9),
      // versionRange
      createDependencyRange(10, 11)
    )
  ],
}