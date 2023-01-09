import * as UnitTests from './unit/index.tests'

const Mocha = require('mocha');
const tty = require('tty');

require('mocha-ui-esm').default();

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
if (!tty.getWindowSize) tty.getWindowSize = function () { return [80, 75]; };

const runner = new Mocha({
  ui: 'esm',
  reporter: 'spec',
  timeout: 60000,
  color: true
});

// set up the global variables
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
