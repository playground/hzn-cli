#! /usr/bin/env node
import { configTemplate } from '../src/common/src/interface';

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
const template = configTemplate;

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
      !json[org] && (json[org] = {})
      !json[org][child] && (json[org][child] = {})
      !newJson[org] && (newJson[org] = {})
      !newJson[org][child] && (newJson[org][child] = {})
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

const checkSystemFiles = () => {
  return new Promise((resolve, reject) => {
    console.log('checking config files are in tact')
    let cwd = process.cwd()
    let files = {
      env: ['env-hzn.json', 'env-local', 'env-support'],
      json: ['deployment.policy.json', 'service.policy.json', 'node.policy.json', 'object.policy.json', 'object.pattern.json', 'top.level.deployment.policy.json', 'example.json', 'mgmt.example.json', 'mms-agent-config.json']
    }
    if(!fs.existsSync(hznConfig)) {
      fs.mkdirSync(hznConfig)
    }
    files.env.forEach((f) => {
      if(!fs.existsSync(`${hznConfig}/.${f}`)) {
        fs.copyFileSync(`${cwd}/src/${f}`, `${hznConfig}/.${f}`)
      }  
    })
    files.json.forEach((f) => {
      if(!fs.existsSync(`${hznConfig}/${f}`)) {
        fs.copyFileSync(`${cwd}/src/hzn-config/${f}`, `${hznConfig}/${f}`)
      }  
    })
    if(!fs.existsSync(`${hznConfig}/services`)) {
      let arg = `cp -R ${cwd}/src/hzn-config/services ${hznConfig}`
      exec(arg, (err, stdout, stderr) => {
        if(err) {
          console.log(`Error: ${err}`);
        }
        resolve('done checking...')  
      });  
    } else {
      resolve('done checking...')  
    }
  })
}

const postInstall = async () => {
  await checkSystemFiles()
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