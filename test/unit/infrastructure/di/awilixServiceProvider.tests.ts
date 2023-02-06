import assert from 'assert';
import { asFunction, asValue, createContainer } from 'awilix';
import { AwilixServiceProvider } from 'infrastructure/di';
import { test } from 'mocha-ui-esm';

export const AwilixServiceProviderTests = {

  [test.title]: AwilixServiceProvider.name,

  constructor: {

    "sets the name and awilix container on the instance": () => {
      const testName = "test container";
      const testContainer = createContainer();

      const actual = new AwilixServiceProvider(
        testName,
        testContainer
      )

      assert.equal(actual.name, testName);
      assert.equal(actual.container, testContainer);
    }

  },

  getService: {

    "resolves services from awilix containers": () => {
      const testName = "test container";
      const testContainer = createContainer();
      const fnServiceName = "testFunction";
      const valServiceName = "testValue";
      const testServices = {
        [fnServiceName]: asFunction(() => { testFn: 123 }),
        [valServiceName]: asValue({ testVal: 123 })
      }

      testContainer.register(testServices);

      const actual = new AwilixServiceProvider(
        testName,
        testContainer
      )

      assert.equal(
        actual.getService(fnServiceName),
        testContainer.resolve(fnServiceName)
      );

      assert.equal(
        actual.getService(valServiceName),
        testContainer.resolve(valServiceName)
      );

    }

  },


};