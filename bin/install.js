#! /usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const exec = cp.exec;
const jsonfile = require('jsonfile');
const homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const hznConfig = `${homePath}/hzn-config`;
const defaultConfig = __dirname;
const constants = fs.constants;

const template = {
  envHzn:   {
    "envVars": {
      "SERVICE_NAME": "saved-model-service",
      "SERVICE_CONTAINER_NAME": "saved-model-service",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_VERSION_RANGE_UPPER": "1.0.0",
      "SERVICE_VERSION_RANGE_LOWER": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "mms_shared_volume",
      "MMS_OBJECT_TYPE": "object_detection",
      "MMS_OBJECT_ID": "config.json",
      "MMS_OBJECT_FILE": "config/config.json",
      "MMS_CONTAINER_CREDS": "",
      "MMS_CONTAINER_NAME": "mms-service",
      "MMS_SERVICE_NAME": "mms-service",
      "MMS_SERVICE_VERSION": "1.0.0",
      "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",
      "UPDATE_FILE_NAME": "model.zip"
    },
    "metaVars": {
    }
  },
  envLocal: {
    "YOUR_DOCKERHUB_ID": "",
    "HZN_EXCHANGE_USER_AUTH": "",
    "HZN_EXCHANGE_URL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-exchange/v1",
    "HZN_FSS_CSSURL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-css",
    "HZN_CUSTOM_NODE_ID": "",
    "DEFAULT_ORG": "biz",
    "ANAX": "api/v1/objects/IBM/agent_files/agent-install.sh/data"
  },
  envSupport: {
    "SUPPORTED_OS_APPEND": "",
    "SUPPORTED_LINUX_DISTRO_APPEND": "",
    "SUPPORTED_DEBIAN_VARIANTS_APPEND": "",
    "SUPPORTED_DEBIAN_VERSION_APPEND": "",
    "SUPPORTED_DEBIAN_ARCH_APPEND": "",
    "SUPPORTED_REDHAT_VARIANTS_APPEND": "",
    "SUPPORTED_REDHAT_VERSION_APPEND": "",
    "SUPPORTED_REDHAT_ARCH_APPEND": ""
  }
}

const getPropsFromFile = (file) => {
  let props = {};
  try {
    if(fs.existsSync(file)) {
      let data = fs.readFileSync(file).toString().split('\n');
      data.forEach((el, i) => {
        if(el.length > 0) {
          let prop = el.split('=');
          if(prop && prop.length > 0) {
            if(prop[0] === 'HZN_CUSTOM_NODE_ID' && (!prop[1] || prop[1].length == 0)) {
              prop[1] = os.hostname();
            }
            props[prop[0]] = prop[1];
          }  
        }
      });  
    }  
  } catch(e) {
    console.log(e)
    props = [];
  }
  return props;
}

const updateEnvFile = (fname, index) => {
  let props = getPropsFromFile(fname);
  let newProps = {};
  Object.keys(template[index]).forEach((key) => {
    if(!props[key]) {
      newProps[key] = template[index][key]
    } else {
      newProps[key] = props[key]
    }
  })
  let content = '';
  Object.keys(newProps).forEach((key) => {
    content += `${key}=${newProps[key]}\n`; 
  })
  fs.writeFileSync(fname, content);
}

const updateJsonFile = (fname, index) => {
  let json = jsonfile.readFileSync(fname);
  let newJson = {};
  Object.keys(template[index]).forEach((child) => {
    let node = template[index][child];
    Object.keys(json).forEach((org) => {
      if(!newJson[org]) {
        newJson[org] = {}
      }
      if(!newJson[org][child]) {
        newJson[org][child] = {}
      }
      Object.keys(node).forEach((key) => {
        if(!json[org][child][key]) {
          newJson[org][child][key] = node[key];
        } else {
          newJson[org][child][key] = json[org][child][key]
        }
      })  
    })
  })
  jsonfile.writeFileSync(fname, newJson, {spaces: 2});
}

const postInstall = () => {
  let arg = ''
  if(fs.existsSync(`${hznConfig}/.env-local`)) {
    updateEnvFile(`${hznConfig}/.env-local`, 'envLocal')
  } else {
    arg = `sudo cp ${path.join(__dirname, '../src')}/env-local ${hznConfig}/.env-local && sudo chmod 766 ${hznConfig}/.env-local`
    exec(arg, (err, stdout, stderr) => {
      if(!err) {
        updateEnvFile(`${hznConfig}/.env-local`, 'envLocal')
      } else {
        console.log(`Error: ${err}`);
      }
    });
  }
  if(fs.existsSync(`${hznConfig}/.env-support`)) {
    updateEnvFile(`${hznConfig}/.env-support`, 'envSupport')
  } else {
    arg = `sudo cp ${path.join(__dirname, '../src')}/env-support ${hznConfig}/.env-support && sudo chmod 766 ${hznConfig}/.env-support`
    exec(arg, (err, stdout, stderr) => {
      if(!err) {
        updateEnvFile(`${hznConfig}/.env-support`, 'envSupport')
      } else {
        console.log(`Error: ${err}`);
      }
    });
  }
  if(fs.existsSync(`${hznConfig}/.env-hzn.json`)) {
    updateJsonFile(`${hznConfig}/.env-hzn.json`, 'envHzn')
  } else {
    arg = `sudo cp ${path.join(__dirname, '../src')}/env-hzn.json ${hznConfig}/.env-hzn.json && sudo chmod 766 ${hznConfig}/.env-hzn.json`
    exec(arg, (err, stdout, stderr) => {
      if(!err) {
        updateJsonFile(`${hznConfig}/.env-hzn.json`, 'envHzn')
      } else {
        console.log(`Error: ${err}`);
      }
    });
  }
};

postInstall()