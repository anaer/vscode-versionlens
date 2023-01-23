import assert from 'assert';
import { IVsCodeWorkspace, VsCodeConfig } from 'domain/configuration';
import { instance, mock, when } from 'ts-mockito';
import { VsCodeWorkspaceStub } from './stubs/vsCodeWorkspaceStub';

let workspaceMock: IVsCodeWorkspace;

export const VsCodeFrozenConfigTests = {

  title: VsCodeConfig.name,

  beforeAll: () => {
    workspaceMock = mock(VsCodeWorkspaceStub);
  },

  "get": {

    "accesses frozen repo after first call": () => {
      const testSection = 'testsection'
      const testKey = 'some_property';
      let expectedFrozenValue = 'test value';

      when(workspaceMock.getConfiguration(testSection))
        .thenReturn({
          get: section => <any>expectedFrozenValue
        })

      // get hot value
      const cut = new VsCodeConfig(instance(workspaceMock), testSection);
      const first = cut.get(testKey);
      assert.equal(first, expectedFrozenValue)

      // change value
      when(workspaceMock.getConfiguration(testSection)).thenReturn(<any>'hot value')

      // should still return frozen value
      const actualFrozen = cut.get(testKey);

      assert.equal(actualFrozen, expectedFrozenValue)
    },

    "returns hot value after defrost is called": () => {
      const testSection = 'testsection'
      const testKey = 'some_property';
      let initialValue = 'test value';

      when(workspaceMock.getConfiguration(testSection))
        .thenReturn({
          get: section => <any>initialValue
        })

      // get hot value
      const cut = new VsCodeConfig(instance(workspaceMock), testSection);
      const first = cut.get(testKey);
      assert.equal(first, initialValue)

      // change expected hot value
      const expectedHotValue = 'hot value';
      when(workspaceMock.getConfiguration(testSection))
        .thenReturn({
          get: section => <any>expectedHotValue
        })

      // should return hot value
      cut.defrost();
      const actualFrozen = cut.get(testKey);

      assert.equal(actualFrozen, expectedHotValue)
    }

  }

}