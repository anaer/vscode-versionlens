import Mocha from 'mocha';
import { registerMochaUiEsm, SortByEnum } from 'mocha-ui-esm';
import SourceMaps from 'source-map-support';
import * as UnitTests from './unit/index.tests';

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

SourceMaps.install();

export function run(): Promise<void> {
  return new Promise((success, failed) => {
    try {
      runner.run(
        failures => {
          if (failures)
            failed(new Error(`${failures} tests failed.`));
          else
            success();
        }
      );
    } catch (err) {
      console.error(err);
      failed(err);
    }
  });
}

if (process.env.TEST && process.env.TEST === 'unit') {
  run().catch(e => process.exit(1));
}
