import config from './libs/config.js';
import * as applib from './libs/app-lib.js';

const is_admin = applib.running_as_admin();

// Validate if running with Administrative (Root) permissions is allowed.
if (is_admin && !config.SECURITY.RUN_AS_ADMIN) {
  console.log("ERROR: Running with Administrative permissions is not permitted.");
  console.log("       See: " + config.APP.CONF_FILE);
  process.exit(1);
}

// Set Lock File to prevent multiple instances from running at the same time.
if (!applib.get_lock(config.APP.LOCK_FILE)) { process.exit(1); }

applib.logger('=======================================')
applib.logger('INFO : STARTING : ' + config.PACKAGE.title + ' : v' + config.PACKAGE.version + " : PID = " + process.pid);


// ====================== Main Application Logic ======================

// Query ACEP Directory

// DEBUG
console.log(JSON.stringify(config, null, 2))

// ====================== End Main Application Logic ======================

// Exit Handlers

applib.exit_process(0); // Exit the process with a success code

process.on('SIGINT', () => {
    applib.exit_process(0);
});

process.on('SIGTERM', () => {
    applib.exit_process(0);
});
