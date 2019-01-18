/* 
Need to use this file to register module-alias path aliases.
*/
require('module-alias/register');
if (process.argv.length < 3) {
    throw new Error(`Test type not provided in command line parameters: unit-test-runner (config file)`);
}
let configFile = process.argv[2];
let Jasmine = require('jasmine');
let jas = new Jasmine();
jas.loadConfigFile(configFile);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
// setup console reporter
const JasmineConsoleReporter = require('jasmine-console-reporter');
const reporter = new JasmineConsoleReporter({
    colors: 1,           // (0|false)|(1|true)|2
    cleanStack: 1,       // (0|false)|(1|true)|2|3
    verbosity: 4,        // (0|false)|1|2|(3|true)|4|Object
    listStyle: 'indent', // "flat"|"indent"
    timeUnit: 'ms',      // "ms"|"ns"|"s"
    timeThreshold: { ok: 500, warn: 1000, ouch: 3000 }, // Object|Number
    activity: true,
    emoji: true,         // boolean or emoji-map object
    beep: true
});
 
// initialize and execute
jas.env.clearReporters();
jas.addReporter(reporter);

let specList = process.argv.slice(3);
if (specList.length) {
    jas.execute(specList);
}
else {
    jas.execute();
}
