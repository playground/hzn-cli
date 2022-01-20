#! /usr/bin/env node
const fs = require('fs');
const os = require('os');
const jsonfile = require('jsonfile');
const hznConfig = '/etc/default/config';

const template = {
  envHzn:   {
    "envVars": {
      "ANAX": "",
      "SERVICE_NAME": "saved-model-service",
      "SERVICE_CONTAINER_NAME": "saved-model-service",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "demo_model_mms_helper_shared_volume",
      "MMS_CONTAINER_CREDS": "",
      "MMS_CONTAINER_NAME": "mms-service",
      "MMS_SERVICE_NAME": "mms-service",
      "MMS_SERVICE_VERSION": "1.0.0",
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
    "DEFAULT_ORG": ""
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
    Object.keys(template.envLocal).forEach((key) => {
      if(!props[key]) {
        props[key] = template.envLocal[key]
      }
    })
    let content = '';
    Object.keys(props).forEach((key) => {
      content += `${key}=${props[key]}\n`; 
    })
    fs.writeFileSync(`${hznConfig}/.env-local`, content);
  }
  if(fs.existsSync(`${hznConfig}/.env-hzn.json`)) {
    let json = jsonfile.readFileSync(`${hznConfig}/.env-hzn.json`);
    Object.keys(template.envHzn).forEach((child) => {
      let node = template.envHzn[child];
      Object.keys(json).forEach((org) => {
        Object.keys(node).forEach((key) => {
          if(!json[org][child][key]) {
            json[org][child][key] = node[key];
          }
        })  
      })
    })
    jsonfile.writeFileSync(`${hznConfig}/.env-hzn.json`, json, {spaces: 2});
  }
};

postInstall()