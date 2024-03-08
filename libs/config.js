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


// Expand Config Variables

let default_dirs = {
  'CONF_DIR': "conf",
  'DATA_DIR': "data",
  'LOG_DIR': "log",
  'TMP_DIR': "tmp"
};

for (let k in config.APP) {
  if (config.APP[k] == "" && Object.keys(default_dirs).includes(k)) {
    config.APP[k] = path.join(config.APP.RUN_DIR, default_dirs[k])
  }

  for (let kk in config.APP) {
    config.APP[k] = config.APP[k].replace(RegExp(kk, 'g'), config.APP[kk]);
  }
}

// Ensure Directories Exist
for (let d in default_dirs) {
  if (!config.APP.hasOwnProperty(d) || config.APP[ d ] == "") {
    console.log('ERROR : DIRECTORY : ' + d + ' is not defined')
    process.exit(1);
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
      console.log('SETUP : MKDIR : ' + config.APP[ d ])
    } catch (e) {
      console.log('ERROR:  Could not MKDIR Config Dir: ' + config.APP[ d ]);
      console.log(e);
      process.exit(1);
    }
  }
}


// Load Package Information
config.PACKAGE = JSON.parse(fs.readFileSync(path.join(dirname, '..', 'package.json'), 'utf8'))

// Parse Package Dependencies from the node_modules directory respective package.json files.
for (let dep in config.PACKAGE.dependencies) {
  let dep_file = path.join(config.APP.RUN_DIR, 'node_modules', dep, 'package.json');
  console.log("DEBUG: DEP: " + dep + ' ' + dep_file);
  try {
    config.PACKAGES[dep] = JSON.parse(fs.readFileSync(dep_file, 'utf8'));
  } catch (e) {
    console.log('ERROR: Could not read Dependency File: ' + dep_file);
    console.log(e);
    exit_process(1);
  }
  
}

// Load Host Information
config.HOST = {};
config.HOST.HOSTNAME = os.hostname();
config.HOST.OS = os.platform();
config.HOST.ARCH = os.arch();

// Load Node.js Information
config.NODE = {};
config.NODE.VERSION = process.version;
config.NODE.PATH = process.execPath;
config.NODE.ARGS = process.argv;


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

// Custom Config Variables
config.APP.LOG_FILE = path.join(config.APP.LOG_DIR, config.PACKAGE.name + '.log');
config.APP.LOCK_FILE = path.join(config.APP.TMP_DIR, config.PACKAGE.name + '.lock');

// config.WEB = {};
// config.WEB.PROTO = "http://";
// if (config.SECURITY.HTTPS) {config.WEB.PROTO = "https://";}
// config.WEB.BASEHOST = 'localhost';
// config.WEB.BASE_URL = config.WEB.PROTO + config.WEB.BASEHOST + ':' + config.APP.API_TCP_PORT;


export default config;

