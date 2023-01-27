import Mocha from 'mocha'
import { registerMochaUiEsm, SortByEnum } from 'mocha-ui-esm'
import * as UnitTests from './unit/index.tests'

registerMochaUiEsm({
  sort: SortByEnum.all
});

const runner = new Mocha({
  ui: <any>'esm',
  reporter: 'spec',
  timeout: 60000,
  color: true
});

// add esm unit tests to mocha
runner.suite.emit('modules', UnitTests);

require('source-map-support').install();

export function run(testRoot, onComplete) {

  runner.run(function (failures) {
    if (failures)
      onComplete(null, failures);
    else
      onComplete(null, 0);
  });

}

if (process.env.TEST && process.env.TEST === 'unit') {
  runner.run()
}
