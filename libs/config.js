// config.js

// ES6
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

let config_file = path.join(dirname, '..', 'conf', 'config.json')
// console.log("config_file: " + config_file)

let config;


try {
  config  = JSON.parse(fs.readFileSync(config_file, 'utf8'));
} catch (e) {
  console.log(e);
  process.exit(1);
}

config.APP.CONF_FILE = config_file;
config.APP.RUN_DIR = path.join(dirname, '..');

config.PACKAGE = JSON.parse(fs.readFileSync(path.join(dirname, '..', 'package.json'), 'utf8'))

// Initialize Directories
let dirs = {
  'CONF_DIR': "conf",
  'DATA_DIR': "data",
  'TMP_DIR': "",
  'LOG_DIR': "log"
};

for (let d in dirs) {
  if (!config.APP.hasOwnProperty(d) || config.APP[ d ] == "") {
    if (dirs[d].match(RegExp('^\/'))) {
      config.APP[ d ] = dirs[d];
    } else {
      config.APP[ d ] = path.join(dirname, '..', dirs[d])
    }

    try { // If config dir exists
      let stats = fs.lstatSync(path.join(config.APP[ d ]));

      if (!stats.isDirectory()) {
        console.log('ERROR: ' + config.APP[ d ] + " is not a Directory.");
        process.exit(1);
      }
    } catch (e) {
      try {
        fs.mkdirSync(config.APP[ d ], { recursive: true });
      } catch (e) {
        console.log('ERROR:  Could not MKDIR Config Dir: ' + config.APP[ d ]);
        console.log(e);
        process.exit(1);
      }
    }
  }
}
config.APP.LOG_FILE = path.join(config.APP.LOG_DIR, config.PACKAGE.name + '.log');
config.APP.LOCK_FILE = path.join(config.APP.TMP_DIR, config.PACKAGE.name + '.lock');

config.HOST = {};
config.HOST.HOSTNAME = os.hostname();

// config.WEB = {};
// config.WEB.PROTO = "http://";
// if (config.SECURITY.HTTPS) {config.WEB.PROTO = "https://";}
// config.WEB.BASEHOST = 'localhost';
// config.WEB.BASE_URL = config.WEB.PROTO + config.WEB.BASEHOST + ':' + config.APP.API_TCP_PORT;

// Import Include Configs
for (let inc in config.INCLUDES) {
  let inc_file = path.join(config.APP.CONF_DIR, config.INCLUDES[inc]);
  // console.log("DEBUG: INC: " + inc + ' ' + inc_file);
  config[inc] = JSON.parse(fs.readFileSync(inc_file), 'utf8');
  if (config[inc].hasOwnProperty('INCLUDES')) {
    for (let incinc in config[inc]['INCLUDES']) {
      let incinc_file = path.join(config.APP.CONF_DIR, config[inc]['INCLUDES'][incinc]);
      // console.log("DEBUG: INCINC: " + incinc + ' ' + incinc_file);
      config[inc][incinc] = JSON.parse(fs.readFileSync(incinc_file), 'utf8');
    }
  }
}

export default config;

