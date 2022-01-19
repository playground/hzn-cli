#! /usr/bin/env node
const path = require('path');
const cp = require('child_process'),
  exec = cp.exec;
const fs = require('fs');

const task = process.env.npm_config_task;
let userName = process.env.npm_config_username;
let imageName = process.env.npm_config_imagename;
let version = process.env.npm_config_imageversion;
const hznConfig = process.env.npm_config_hznconfig;
let org = process.env.npm_config_org || 'biz';

console.log('current directory: ', process.cwd());
let build = {
  getConfig: () => {
    if(fs.existsSync(hznConfig)) {
      let hznJson = JSON.parse(fs.readFileSync(hznConfig).toString());
      let envVars = hznJson[org]['envVars'];
      userName = envVars.YOUR_DOCKERHUB_ID;
      imageName = envVars.SERVICE_NAME;
      version = envVars.SERVICE_VERSION;
    }
  },
  dockerImage: () => {
    if(hznConfig) {
      build.getConfig();
    }
    if(userName && imageName && version) {
      let arg = `hzn architecture`
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          let arch = stdout.replace(/\r?\n|\r/g, '');
          arg = `docker build -t ${userName}/${imageName}_${arch}:${version} -f Dockerfile-${arch} .`;
          exec(arg, {maxBuffer: 1024 * 3500}, (err, stdout, stderr) => {
            if(!err) {
              console.log(stdout)
              console.log(`done building image ${imageName}`);
            } else {
              console.log(`failed to build image ${imageName}`, err);
            }
          });
        } else {
          console.log('failed to identify arch', err);
        }
      });  
    } else {
      console.log('docker username, imagename and imageversion are required...');
      process.exit(0);
    }
  },
  pushImage: () => {
    if(hznConfig) {
      build.getConfig();
    }
    if(userName && imageName && version) {
      let arg = `hzn architecture`
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          let arch = stdout.replace(/\r?\n|\r/g, '');
          arg = `docker push ${userName}/${imageName}_${arch}:${version}`;
          exec(arg, {maxBuffer: 1024 * 3500}, (err, stdout, stderr) => {
            if(!err) {
              console.log(stdout)
              console.log(`done publishing image ${imageName}`);
            } else {
              console.log(`failed to publish image ${imageName}`, err);
            }
          });
        } else {
          console.log('failed to identify arch', err);
        }
      });  
    } else {
      console.log('docker username, imagename and imageversion are required...');
      process.exit(0);
    }
  },
  default: () => {
    console.log('command not found.');
    process.exit(0);
  }
}

build[task] ? build[task]() : build.default();
