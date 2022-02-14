#! /usr/bin/env node
const fs = require('fs');
const os = require('os');
const jsonfile = require('jsonfile');
const homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const hznConfig = `${homePath}/config`;
const constants = fs.constants;

const template = {
  envHzn:   {
    "envVars": {
      "SERVICE_NAME": "saved-model-service",
      "SERVICE_CONTAINER_NAME": "saved-model-service",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_VERSION_RANGE": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "demo_model_mms_helper_shared_volume",
      "MMS_CONTAINER_CREDS": "",
      "MMS_CONTAINER_NAME": "mms-service",
      "MMS_SERVICE_NAME": "mms-service",
      "MMS_SERVICE_VERSION": "1.0.0",
      "MMS_SERVICE_VERSION_RANGE": "1.0.0",
      "MMS_OBJECT_TYPE": "object_detection",
      "MMS_OBJECT_ID": "config.json",
      "MMS_OBJECT_FILE": "config/config.json",
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
    "ANAX": "api/v1/objects/IBM/agent_files/agent-install.sh/data",
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

const postInstall = () => {
  if(fs.existsSync(`${hznConfig}/.env-local`)) {
    let props = getPropsFromFile(`${hznConfig}/.env-local`);
    let newProps = {};
    Object.keys(template.envLocal).forEach((key) => {
      if(!props[key]) {
        newProps[key] = template.envLocal[key]
      } else {
        newProps[key] = props[key]
      }
    })
    let content = '';
    Object.keys(newProps).forEach((key) => {
      content += `${key}=${newProps[key]}\n`; 
    })
    fs.writeFileSync(`${hznConfig}/.env-local`, content);
  }
  if(fs.existsSync(`${hznConfig}/.env-hzn.json`)) {
    let json = jsonfile.readFileSync(`${hznConfig}/.env-hzn.json`);
    let newJson = {};
    Object.keys(template.envHzn).forEach((child) => {
      let node = template.envHzn[child];
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
    jsonfile.writeFileSync(`${hznConfig}/.env-hzn.json`, newJson, {spaces: 2});
  }
};

postInstall()