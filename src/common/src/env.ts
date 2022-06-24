declare var require: any

import { Observable } from 'rxjs';
import { readFileSync, existsSync } from 'fs';
const cp = require('child_process'),
exec = cp.exec;
const dotenv = require('dotenv');

const pEnv: any = process.env;

export class Env {
  env: string;
  envVars: any;
  hznJson: any;
  hznEnv: any;
  hznConfig: string;
  constructor(env: string, hznConfig: string) {
    this.env = env;
    this.hznConfig = hznConfig;
    this.hznEnv = `${hznConfig}/.env-hzn.json`;
  }
  init() {
    return new Observable((observer) => {
      const localEnv = dotenv.parse(readFileSync(`${this.hznConfig}/.env-local`));
      for(let i in localEnv) {
        pEnv[i] = localEnv[i];
      }
      const supportEnv = dotenv.parse(readFileSync(`${this.hznConfig}/.env-support`));
      for(let i in supportEnv) {
        pEnv[i] = supportEnv[i];
      }
      const hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
      const credential = hznJson[this.env].credential
      if(credential) {
        Object.keys(credential).forEach((key) => {
          pEnv[key] = credential[key]
        })  
      }
      pEnv.HZN_ORG_ID = this.env;
      this.hznJson = JSON.parse(readFileSync(this.hznEnv).toString());
      // console.log(process.cwd(), this.env, this.hznJson)
      this.envVars = this.hznJson[this.env]['envVars'];
      for(const [key, value] of Object.entries(this.envVars)) {
        if(!pEnv[key]) {
          // @ts-ignore
          pEnv[key] = value.replace(/\r?\n|\r/g, '');
        } 
        // console.log(`${key}: ${pEnv[key]}`);
      }
      if(!this.envVars.ARCH || this.envVars.ARCH === undefined) {
        let arg = `hzn architecture`
        exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
          if(!err) {
            pEnv.ARCH = this.envVars.ARCH = stdout.replace(/\r?\n|\r/g, '');
            this.setAdditionalEnv();
            observer.next();
            observer.complete();
          } else {
            console.log('failed to identify arch');
            observer.error(err);
          }
        });  
      } else {
        console.log(this.envVars.ARCH, 'here')
        this.setAdditionalEnv();
        console.log(this.envVars.ARCH)
        observer.next();
        observer.complete();
      }      
    });
  }
  setAdditionalEnv() {
    let container = pEnv.MMS_CONTAINER_NAME || pEnv.MMS_SERVICE_NAME;
    pEnv.MMS_PATTERN_NAME = `pattern-${pEnv.MMS_SERVICE_NAME}-${pEnv.ARCH}`;
    pEnv.MMS_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.MMS_SERVICE_VERSION}`.replace(/\r?\n|\r/g, '')
    pEnv.PATTERN_NAME = `pattern-${pEnv.SERVICE_NAME}`;
    container = pEnv.SERVICE_CONTAINER_NAME || pEnv.SERVICE_NAME;
    pEnv.SERVICE_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.SERVICE_VERSION}`.replace(/\r?\n|\r/g, '')
  }
  getEnvValue(key: string) {
    return pEnv[key];
  }
  getEnv() {
    return this.env;
  }
  getOrgId() {
    console.log(pEnv.HZN_ORG_ID)
    return pEnv.HZN_ORG_ID;
  }
  getExchangeUserAuth() {
    return pEnv.HZN_EXCHANGE_USER_AUTH;
  }
  getExchangeUrl() {
    return pEnv.HZN_EXCHANGE_URL;
  }
  getFSSCSSUrl() {
    return pEnv.HZN_FSS_CSSURL;
  }
  getServiceName() {
    return pEnv.SERVICE_NAME;
  }
  getServiceVersion() {
    return pEnv.SERVICE_VERSION;
  }
  getMMSSharedVolume() {
    return pEnv.MMS_SHARED_VOLUME;
  }
  getMyDockerHubId() {
    return pEnv.YOUR_DOCKERHUB_ID;
  }
  getDockerImageBase() {
    return `${pEnv.YOUR_DOCKERHUB_ID}/${pEnv.MMS_SERVICE_NAME}`;
  }
  getMMSContainerCreds() {
    return pEnv.MMS_CONTAINER_CREDS;
  }
  getMMSPatterName() {
    return pEnv.MMS_PATTERN_NAME;
  }
  getMMSServiceName() {
    return pEnv.MMS_SERVICE_NAME;
  }
  getMMSServiceVersion() {
    return pEnv.MMS_SERVICE_VERSION;
  }
  getMMSContainer() {
    return pEnv.MMS_CONTAINER;
  }
  getArch() {
    return pEnv.ARCH;
  }
  getMMSObjectType() {
    return pEnv.MMS_OBJECT_TYPE;
  }
  getMMSObjectId() {
    return pEnv.MMS_OBJECT_ID
  }
  getMMSObjectFile() {
    return pEnv.MMS_OBJECT_FILE
  }
  getServiceContainerCreds() {
    return pEnv.SERVICE_CONTAINER_CREDS;
  }
  getPatternName() {
    return pEnv.PATTERN_NAME;
  }
  getServiceContainer() {
    return pEnv.SERVICE_CONTAINER;
  }
  getAnax() {
    return pEnv.ANAX || null;
  }
  getInputFilePath() {
    return pEnv.INPUT_FILE_PATH || null;
  }
  getHznNodeID() {
    return pEnv.HZN_CUSTOM_NODE_ID || null;
  }
}
