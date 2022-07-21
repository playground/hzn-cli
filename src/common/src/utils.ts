declare var require: any
declare var process: any

import { Observable, of, firstValueFrom, Observer, forkJoin, from } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;
import { readFileSync, writeFileSync, copyFileSync , existsSync, exists } from 'fs';
import os from 'os';
const ifs: any = os.networkInterfaces();
import prompt from 'prompt';
export const promptSync = require('prompt-sync')();
import jsonfile from 'jsonfile';
import { utils } from '.';
import { fork } from 'child_process';
import { URL } from 'url';
import { Env } from './env';
import { IHznParam } from './interface';

const env = process.env.npm_config_env || 'biz';
const isBoolean = [
  'TOP_LEVEL_SERVICE'
]
const notRequired = [
  'SERVICE_CONTAINER_CREDS', 'MMS_CONTAINER_CREDS', 'OBJECT_FILE', 'OBJECT_ID', 'OBJECT_TYPE', 'HZN_CUSTOM_NODE_ID', 'UPDATE_FILE_NAME',
  'SUPPORTED_OS_APPEND', 'SUPPORTED_LINUX_DISTRO_APPEND', 'SUPPORTED_DEBIAN_VARIANTS_APPEND', 'SUPPORTED_DEBIAN_VERSION_APPEND',
  'SUPPORTED_DEBIAN_ARCH_APPEND', 'SUPPORTED_REDHAT_VARIANTS_APPEND', 'SUPPORTED_REDHAT_VERSION_APPEND', 'SUPPORTED_REDHAT_ARCH_APPEND'
];
const mustHave = [
  "SERVICE_NAME",
  "SERVICE_CONTAINER_NAME",
  "SERVICE_VERSION",
  "SERVICE_VERSION_RANGE_UPPER",
  "SERVICE_VERSION_RANGE_LOWER",
  "SERVICE_CONTAINER_CREDS",
  "VOLUME_MOUNT",
  "MMS_SHARED_VOLUME",
  "MMS_OBJECT_TYPE",
  "MMS_OBJECT_ID",
  "MMS_OBJECT_FILE",
  "MMS_CONTAINER_CREDS",
  "MMS_CONTAINER_NAME",
  "MMS_SERVICE_NAME",
  "MMS_SERVICE_VERSION",
  "MMS_SERVICE_FALLBACK_VERSION",
  "UPDATE_FILE_NAME"
];
const credentialVars = [
  "HZN_EXCHANGE_USER_AUTH",
  "HZN_EXCHANGE_URL",
  "HZN_FSS_CSSURL",
  "ANAX"
]

export class Utils {
  etcDefault = '/etc/default';
  etcHorizon = '/etc/horizon';
  homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  hznConfig = `${this.homePath}/hzn-config`;
  constructor() {
  }
  init() {
  }
  getEtcDefault() {
    return this.etcDefault
  }
  getHznConfig() {
    return this.hznConfig
  }
  listAgreement(param: IHznParam) {
    const arg = `${param.watch} hzn agreement list`;
    return this.shell(arg);
  }
  listService(param: IHznParam) {
    return new Observable((observer) => {
      this.listAllServices(param)
      .subscribe({
        next: (res: string) => {
          const pEnv: any = process.env;
          let services: string[] = res.replace(/\r?\n|\r|\[|\]|"/g, '').split(',')
          let filter = param.filter && param.filter.length > 0 ? param.filter : pEnv.ARCH
          let archFilter = services.filter((r) => r.indexOf(filter) > 0)
          if(archFilter.length < services.length) {
            console.log(`Services for ${filter}:\n${archFilter.join(',\n')}`)
          }
          observer.next('')
          observer.complete()
        },
        error: (err: any) => observer.error(err)
      })
    })  
  }
  listAllServices(param: IHznParam) {
    const arg = param.name.length > 0 ? `hzn exchange service list ${param.name} --org ${param.org}` : `hzn exchange service list --org ${param.org}`;
    return param.name.length > 0 ? this.shell(arg, 'commande executed successfully', 'failed to execute command', false) : this.shell(arg)
  }
  listPattern(name: string) {
    const arg = name.length > 0 ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listNode(param: IHznParam) {
    const arg = 'hzn node list';
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listExchangeNode(param: IHznParam) {
    const arg = param.name.length > 0 ? `hzn exchange node list ${param.name}` : 'hzn exchange node list';
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listPolicy() {
    const arg = 'hzn policy list'
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listExchangeNodePolicy(param: IHznParam) {
    const arg = `hzn exchange node listpolicy ${param.name}`;
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listServicePolicy(name: string) {
    const arg = `hzn exchange service listpolicy ${name}`
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  listDeploymentPolicy(name: string) {
    const arg = name.length > 0 ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
    return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
  }
  removeDeploymentPolicy(name: string) {
    return new Observable((observer) => {
      const arg = `yes | hzn exchange deployment removepolicy ${name}`
      const msg = `\nAre you sure you want to remove ${name} deployment policy from the Horizon Exchange? [y/N]:`
      this.areYouSure(arg, msg)
      .subscribe({
        complete: () => {
          observer.complete()
        },
        error: (err) => observer.error(err)
      })
    })  
  }
  areYouSure(arg: string, msg: string) {
    return new Observable((observer) => { 
      console.log(msg)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          this.shell(arg)
          .subscribe({
            complete: () => {
              observer.complete()
            },
            error: (err) => observer.error(err)
          })
        } else {
          observer.complete()
        }
      })  
    })  
  }
  removeNode(name: string) {
    return new Observable((observer) => {
      const arg = `yes | hzn exchange node remove ${name}`;
      const msg = `\nAre you sure you want to remove node ${name} from the Horizon Exchange? [y/N]:`
      this.areYouSure(arg, msg)
      .subscribe({
        complete: () => {
          observer.complete()
        },
        error: (err) => observer.error(err)
      })
    })  
  }
  listObject(param: IHznParam) {
    const arg = param.name.length > 0 ? `${param.watch}hzn mms object list ${param.name}` : `${param.watch}hzn mms object list -t ${param.objectType} -i ${param.objectId} -d`;
    return utils.shell(arg, 'done listing object', 'failed to list object', false);
  }
  createHznKey(org: string, id: string) {
    if(org && id) {
      return this.shell(`hzn key create ${org} ${id}`);  
    } else {
      console.log('please provide both <YOUR_DOCKERHUB_ID> and <HZN_ORG_ID> in .env-hzn.json')
      return of();
    }
  }
  checkConfigState() {
    const arg = `hzn node list | jq '.configstate.state,.organization,.configuration.exchange_api,.configuration.mms_api'`
    return this.shell(arg, 'check node configure state', 'failed to execute', true);  
  }
  listNodePattern() {
    return this.shell(`hzn node list | jq .pattern`);  
  }
  getDeviceArch() {
    return this.shell(`hzn architecture`);  
  }
  checkOS() {
    return this.shell(`cat /etc/os-release`);  
  }
  getIpAddress() {
    return Object.keys(ifs)
    .map(x => [x, ifs[x].filter(x => x.family === 'IPv4')[0]])
    .filter(x => x[1])
    .map(x => x[1].address);
  }
  aptUpdate() {
    // TODO, if failed run sudo apt-get -y --fix-missing full-upgrade
    // cat info.cfg
    return this.shell(`sudo apt-get -y update && sudo apt-get -yq install jq curl git`);
  }
  installPrereq() {
    return new Observable((observer) => {
      this.aptUpdate()
      .subscribe({
        complete: () => observer.complete(),
        error: () => observer.complete() // Ignore errors
      })
    });
  }
  cleanUp() {
    const arg = `rm -rf ${this.homePath}/.hzn && sudo rm ${process.cwd()}/agent-install* && sudo rm ${this.etcDefault}/horizon && sudo rm -rf ${this.etcHorizon}`
    return this.shell(arg)
  }
  installHznCli(anax: string, id: null, css = true, deviceToken = 'some-device-token') {
    let nodeId = id ? `-a ${id}:${deviceToken}` : '';
    if(anax && anax.indexOf('open-horizon') > 0) {
      // NOTE: for Open Horizon anax would be https://github.com/open-horizon/anax/releases/latest/download
      let tag = css ? 'css:' : 'anax:'
      if(anax.indexOf('latest') < 0) {
        tag = anax.replace('download', 'tag')
      }
      return this.shell(`sudo curl -sSL ${anax}/agent-install.sh | sudo -s -E bash -s -- -i ${tag} ${nodeId} -k css: -c css: -p IBM/pattern-ibm.helloworld -w '*' -T 120`)
    } else {
      // anax = api/v1/objects/IBM/agent_files/agent-install.sh/data
      return this.shell(`sudo curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/${anax} && sudo chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -i 'css:' ${nodeId}`)
    }  
  }
  uninstallHorizon(msg = 'Would you like to proceed to uninstall Horzion: Y/n?') {
    return new Observable((observer) => { 
      console.log(`\n${msg}`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          let arg = `sudo apt-get purge -y bluehorizon horizon horizon-cli`
          if(process.platform == 'darwin') {
            arg = `yes | sudo /Users/Shared/horizon-cli/bin/horizon-cli-uninstall.sh && sudo pkgutil --forget com.github.open-horizon.pkg.horizon-cli`
          }  
          this.shell(arg)
          .subscribe({
            complete: () => {
              this.cleanUp()
              .subscribe({
                complete: () => observer.complete(),
                error: (err) => observer.complete() //ignore error when files do not exist    
              })
            },
            error: (err) => observer.error(err)
          })
        } else {
          observer.complete()
        }
      })  
    })  
  }
  setupManagementHub() {
    return new Observable((observer) => { 
      let ips = this.getIpAddress()
      const pEnv: any = process.env;
      const props = [
        {name: 'HZN_LISTEN_IP', default: ips ? ips[0]: '', ipList: ips, required: true},
        {name: 'HZN_TRANSPORT', default: 'https', required: true},
        {name: 'EXCHANGE_IMAGE_NAME', default: '', required: false},
        {name: 'OH_ANAX_RELEASES', default: 'https://github.com/open-horizon/anax/releases/latest/download', required: true},
        {name: 'EXCHANGE_USER_ORG', default: 'myorg', required: true}
      ]
      console.log(props)
      console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        console.log(result)
        console.log(`\nWould you like to proceed to install Management Hub: Y/n?`)
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            for(const [key, value] of Object.entries(result)) {
              pEnv[key] = value; 
            }
            this.shell(`curl -sSL https://raw.githubusercontent.com/open-horizon/devops/master/mgmt-hub/deploy-mgmt-hub.sh --output deploy-mgmt-hub.sh && chmod +x deploy-mgmt-hub.sh && sudo -s -E -b ./deploy-mgmt-hub.sh`)
            .subscribe({
              next: (res: any) => {
                writeFileSync(`${this.hznConfig}/.secret`, res)
              },
              complete: () => observer.complete(),
              error: (err) => observer.error(err)
            })
          }
        })    
      })
    })    
  }
  copyFile(arg: string) {
    return firstValueFrom(this.shell(arg));
  }
  appendSupport() {
    return new Observable((observer) => { 
      let props = this.getPropsFromFile(`${this.hznConfig}/.env-support`);
      console.log(props)
      console.log(`\nWould you like to change any of the above properties: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
          prompt.get(props, (err: any, result: any) => {
            console.log(result)
            console.log(`\nWould you like to update config files: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              let content = '';
              for(const [key, value] of Object.entries(result)) {
                content += `${key}=${value}\n`; 
              }
              writeFileSync('.env-support', content);
              this.copyFile(`sudo mv .env-support ${this.hznConfig}/.env-support && sudo chmod 766 ${this.hznConfig}/.env-support`).then(() => {
                observer.complete()
              }).catch((err) => {   
                observer.error(err)
              })  
            })
          })        
        } else {
          observer.complete()
        }
      })
    });  
  }
  getPropsFromEnvLocal(org: string) {
    let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
    let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
    if(hznJson[org] && hznJson[org]['credential']) {
      let credential = hznJson[org]['credential']
      Object.keys(credential).forEach((key) => {
        props.some((el, idx) => {
          if(el.name === key && credential[key] && credential[key].length > 0) {
            props[idx].default = credential[key]
            return true
          } else {
            return false
          }
        })
      })
    }
    return props;
  }
  updateEnvFiles(org: string) {
    return new Observable((observer) => {       
      // let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
      let props = this.getPropsFromEnvLocal(org)
      console.log(props)
      console.log(`\nWould you like to change any of the above properties: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
          prompt.get(props, (err: any, result: any) => {
            result = this.filterEnvVars(result)
            console.dir(result, {depth: null, color: true})
            const template = {name: '', value: ''}
            let propName = 'environment variable'
            let answer: string;
            do {
              answer = promptSync(`Would you like to add additional ${propName}: Y/n? `)
              if(answer.toLowerCase() == 'y') {
                this.promptType(propName, result, template)
              }  
            } while(answer.toLowerCase() == 'y')
      
            answer = promptSync(`\nWould you like to update config files: Y/n?`)
            if(answer.toLowerCase() == 'y') {              
              let content = '';
              const pEnv = process.env;
              let defaultOrg = false
              for(const [key, value] of Object.entries(result)) {
                if(key == 'DEFAULT_ORG' && org != value) {
                  defaultOrg = true
                }
                content += key == 'DEFAULT_ORG' && defaultOrg ? `${key}=${org}\n` : `${key}=${value}\n`;
                pEnv[key] = ''+value; 
              }
              writeFileSync('.env-local', content);
              this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
              this.updateAndSaveCredential(org, content)
                .subscribe({
                  complete: () => {
                    this.switchEnvironment(org, pEnv)
                    .subscribe({
                      complete: () => observer.complete(),
                      error: (err) => observer.error(err)
                    })
                  }, error: (err) => observer.error(err)
                })
              })  
            } else {
              observer.complete()
            }
          })        
        } else {
          this.updateEnvHzn(org)
          .subscribe({
            complete: () => observer.complete(),
            error: (err) => observer.error(err)
          })
        }
      })
    });  
  }
  switchEnvironment(org: string, pEnv: any = process.env) {
    return new Observable((observer) => {
      let answer: string;
      this.checkConfigState()
      .subscribe({
        next: (res: string) => {
          console.log('configure', res.replace(/"/g, '').split('\n'))
          let resNode = res.replace(/"/g, '').split('\n')
          let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
          if(resNode && resNode[0].length > 0 && (resNode[0] === 'configured' && resNode[1] !== org || resNode[2].indexOf(hznJson[org].credential.HZN_EXCHANGE_URL) < 0)) {
          console.log(hznJson[org].credential.HZN_EXCHANGE_URL, resNode[2], resNode[2].indexOf(hznJson[org].credential.HZN_EXCHANGE_URL))
            answer = promptSync(`\nThis node is registered with ${resNode[1]}, must unregister before switching to ${org}, unregister Y/n? `)
            if(answer.toLowerCase() == 'y') {
              this.uninstallHorizon('Would you like to proceed to reinstall Horzion: Y/n?')
              .subscribe({
                complete: () => {
                  if(!pEnv.HZN_ORG_ID) {
                    pEnv.HZN_ORG_ID = pEnv.DEFAULT_ORG
                  }
                  let nodeId = pEnv.HZN_CUSTOM_NODE_ID ? pEnv.HZN_CUSTOM_NODE_ID : '';
                  pEnv.NODE_ID = nodeId
                  this.installHznCli(pEnv.ANAX, nodeId)
                  .subscribe({
                    complete: () => observer.complete(),
                    error: (err) => observer.error(err)
                  })    
                }, error: (err) => observer.error(err)
              })
            } else {
              observer.error('do nothing.')
            }                      
          } else {
            observer.next()
            observer.complete()
          }
        },
        error: (err) => observer.error(err)
      })  
    })
  }
  updateAndSaveCredential(org: string, content: string) {
    return new Observable((observer) => {
      this.updateCredential(org)
      writeFileSync('.env-local', content);
      this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
        this.updateEnvHzn(org)
        .subscribe({
          complete: () => observer.complete(),
          error: (err) => observer.error(err)
        })
      })  
    })
  }
  shallowEqual(obj1: any, obj2: any) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    let diff = false
    keys1.some((key) => {
      diff = obj1[key] !== obj2[key]
      return diff
    })
    return !diff;    
  }
  updateOrgConfig(hznJson: any, org: string, newOrg = false) {
    return new Observable((observer) => {
      let props: any[] = [];
      let envVars = hznJson[org]['envVars'];
      let i = 0;
      let pkg;

      if(existsSync('./package.json')) {
        try {
          pkg = jsonfile.readFileSync('./package.json');
        } catch(e) {
          console.log(e)
        }
      }
      console.log('$$herer', __dirname)
      for(const [key, value] of Object.entries(envVars)) {
        if(pkg && pkg.version && (key == 'SERVICE_VERSION' || key == 'MMS_SERVICE_VERSION')) {
          props[i] = {name: key, default: value, package: pkg.version, required: notRequired.indexOf(key) < 0};
        } else {
          props[i] = {name: key, default: value, required: notRequired.indexOf(key) < 0};
        }
        if(isBoolean.indexOf(key) >= 0) {
          props[i]['pattern'] = /^(true|false)$/
          props[i]['message'] = 'Must be true or false'
        }

        i++;
      }
      console.log(props)
      console.log(`\nWould you like to change any of the above properties for ${org}: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
          prompt.get(props, (err: any, result: any) => {
            result = this.filterEnvVars(result)
            console.dir(result, {depth: null, color: true})
            const template = {name: '', value: ''}
            let propName = 'environment variable'
            let answer: string;
            do {
              answer = promptSync(`Would you like to add additional ${propName}: Y/n? `)
              if(answer.toLowerCase() == 'y') {
                this.promptType(propName, result, template)
              }  
            } while(answer.toLowerCase() == 'y')

            console.log(`\nWould you like to save these changes: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              if(question.answer.toUpperCase() === 'Y') {
                for(const [key, value] of Object.entries(result)) {
                  envVars[key] = value;
                }
                jsonfile.writeFileSync('.env-hzn.json', hznJson, {spaces: 2});
                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
                  console.log(`config files updated for ${org}`)
                  observer.next({env: org})
                  observer.complete();
                })
              } else {
                console.log(`config files not updated/created for ${org}`)
                observer.error(`config files not updated/created for ${org}`);
              }
            })
          })        
        } else {
          if(newOrg) {
            console.log(`\nWould you like to save config for ${org}: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              if(question.answer.toUpperCase() === 'Y') {
                jsonfile.writeFileSync('.env-hzn.json', hznJson, {spaces: 2});
                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
                  console.log(`config files updated for ${org}`)
                  observer.next({env: org})
                  observer.complete();
                })
              } else {
                observer.error(`config files not updated for ${org}`)
              }
            })    
          } else {
            console.log(`config files not updated for ${org}`)
            observer.next({env: org})
            observer.complete();
          }
        }  
      })  
    })
  }
  removeOrg(org: string) {
    return new Observable((observer) => {
      let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
      if(hznJson[org]) {
        console.log(hznJson[org])
        console.log(`\nAre you sure you want to delete ${org}: Y/n?`)
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            delete(hznJson[org])
            jsonfile.writeFileSync('.env-hzn.json', hznJson, {spaces: 2});
            this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
              console.log(`config files updated, ${org} has been removed`)
              observer.complete();
            })
          }
        })    
      } else {
        observer.error(`${org} doesn't exist in your environment config.`)
      }
    })    
  }
  updateCredential(org: string) {
    let credential: any = {}
    const pEnv:any = process.env
    let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
    credentialVars.forEach((key) => {
      credential[key] = pEnv[key]
      console.log(key, pEnv[key])
    })
    if(!hznJson[org]) {
      let template = JSON.parse(readFileSync(`${__dirname}/env-hzn-template.json`).toString())
      hznJson[org] = template.properties;
    }
    if(!hznJson[org]['credential']) {
      hznJson[org]['credential'] = {}
    }
    if(!this.shallowEqual(credential, hznJson[org]['credential'])) {
      hznJson[org]['credential'] = credential
      jsonfile.writeFileSync(`${this.hznConfig}/.env-hzn.json`, hznJson, {spaces: 2});
      console.log('update credential')
    }
  }
  orgCheck(org: string, skipUpdate = false) {
    return new Observable((observer) => {
      let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
      if(hznJson[org]) {
        if(!skipUpdate) {
          this.updateOrgConfig(hznJson, org)
          .subscribe({
            next: () => observer.next({env: org}),
            complete: () => observer.complete(),
            error: (err) => observer.error(err) 
          })
        } else {
          observer.complete()
        }
      } else {
        console.log(`\n${org} is not setup in your envvironment, would you like to set it up: Y/n?`)
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            hznJson[org] = Object.assign({}, hznJson.biz);
            this.updateOrgConfig(hznJson, org, true)
            .subscribe({
              next: () => observer.next({env: org}),
              complete: () => observer.complete(),
              error: (err) => observer.error(err) 
            })
          } else {
            observer.error(`config files are not setup for ${org}`)
          }
        })      
      }
    })
  }
  filterEnvVars(result: any) {
    let res = {}
    for(const [key, value] of Object.entries(result)) {
      if(typeof value === 'string' && (value.trim().length > 0 || mustHave.indexOf(key) >= 0)) {
        res[key] = value.trim()
      }
    }
    return res;    
  }
  setupEnvFiles(org: string) {
    return new Observable((observer) => {
      // console.log(process.cwd(), __dirname, __filename)
      let props = this.getPropsFromFile(`${__dirname}/env-local`);
      Object.values(props).some((el) => {
        if(el.name == 'DEFAULT_ORG') {
          el.default = org;
          return true;
        } else {
          return false;
        }
      })
      console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        result = this.filterEnvVars(result)
        console.log(result)
        console.log(`\nWould you like to save config files: Y/n?`)
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            // Copy config/* to user home
            let arg = '';
            if(!existsSync(this.hznConfig)) {
              arg = `sudo cp -rf ${__dirname}/hzn-config ${this.homePath} && sudo chown -R $(whoami) ${this.hznConfig} && cp ${__dirname}/env-support ${this.hznConfig}/.env-support`;
            } else if(!existsSync(`${this.hznConfig}/.env-support`)) {
              arg = `cp ${__dirname}/env-support ${this.hznConfig}/.env-support`;
            }
            this.copyFile(arg).then(() => {
              let content = '';
              for(const [key, value] of Object.entries(result)) {
                content += `${key}=${value}\n`; 
                if(key === 'DEFAULT_ORG') {
                  org = `${value}`;
                  process.env.HZN_ORG_ID = org;
                }
              }
              writeFileSync('.env-local', content);
              this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
                this.copyFile(`sudo cp ${__dirname}/env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
                  this.orgCheck(org)
                  .subscribe({
                    next: () => observer.next({env: org}),
                    complete: () => observer.complete(),
                    error: (err) => observer.error(err)
                  })
                })
              })
            })        
          } else {
            console.log(`config files not saved`)
            observer.error();
          }
        })
      })
    })
  }
  updateEnvHzn(org: string) {
    return new Observable((observer) => {
      this.orgCheck(org)
      .subscribe({
        complete: () => observer.complete(),
        error: (err) => observer.complete()
      })
    })
  }
  checkDefaultConfig() {
    return new Observable((observer) => {
      if(existsSync(`${this.hznConfig}/.env-local`) && existsSync(`${this.hznConfig}/.env-hzn.json`) && existsSync(`${this.hznConfig}/.env-support`)) {
        observer.complete()
      } else {
        observer.error('No config files.  Please run "oh deploy setup"')
      }
    })
  }
  getHznInfo() {
    return readFileSync(`${this.etcDefault}/horizon`).toString().split('\n');
  }
  showHznInfo() {
    return new Observable((observer) => {
      const file = this.getHznInfo();
      console.log(file)
      observer.next(file);
      observer.complete();
    })  
  }
  getPropValueFromFile(file: string, prop: string) {
    let value = '';
    try {
      if(existsSync(file)) {
        let data = readFileSync(file).toString().split('\n');
        Object.values(data).some((el) => {
          let ar = el.split('=');
          if(ar && ar.length > 0 && ar[0] == prop) {
            value = ar[1];
            return true;  
          } else {
            return false;
          }
        }) 
      }
    } catch(e) {
      console.log(e)
    }
    return value;
  }    
  getPropsFromFile(file: string) {
    let props: any[] = [];
    try {
      if(existsSync(file)) {
        let data = readFileSync(file).toString().split('\n');
        data.forEach((el, i) => {
          if(el.length > 0) {
            let prop = el.split('=');
            if(prop && prop.length > 0) {
              if(prop[0] === 'HZN_CUSTOM_NODE_ID' && (!prop[1] || prop[1].length == 0)) {
                prop[1] = os.hostname();
              }
              props[i] = {name: prop[0], default: prop[1], required: notRequired.indexOf(prop[0]) < 0};
              if(isBoolean.indexOf(prop[0]) >= 0) {
                props[i]['pattern'] = /^(true|false)$/
                props[i]['message'] = 'Must be true or false'
              }
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
  updateHorizon(org: string, pEnv: Env) {
    return new Observable((observer) => {
      let horizon = this.nameValueToJson(`${this.etcDefault}/horizon`)
      let hznJson = JSON.parse(readFileSync(`${this.hznConfig}/.env-hzn.json`).toString());
      console.log('check update', org, hznJson[org].credential.HZN_FSS_CSSURL, horizon.HZN_FSS_CSSURL)
      if(hznJson[org].credential.HZN_FSS_CSSURL && hznJson[org].credential.HZN_FSS_CSSURL != horizon.HZN_FSS_CSSURL) {
        let template = JSON.parse(readFileSync(`${__dirname}/env-hzn-template.json`).toString())
        let url: any = new URL(hznJson[org].credential.HZN_FSS_CSSURL)
        let type = url.port ? template['oh'] : template['ieam']
        let hostname = `${url.protocol}//${url.hostname}`
        let content = ''
        Object.keys(type).forEach((key) => {
          content += `${key}=${this.tokenReplace(type[key], {HOSTNAME: hostname, HZN_DEVICE_ID: horizon.HZN_DEVICE_ID, HZN_NODE_ID: horizon.HZN_NODE_ID})}\n`; 
        })
        console.log('update horizon')
        console.log(content)
        this.updateCert(org, pEnv)
        .subscribe({
          complete: () => {
            //todo writeHorizon
            this.writeHorizon(content)
            .subscribe(() => observer.complete())
          }, error: (err: any) => observer.error(err)
        })
      } else {
        observer.next()
        observer.complete()
      }
    })  
  }
  updateCert(org: string, pEnv: Env) {
    return new Observable((observer) => {
      if(existsSync(`${this.etcHorizon}/agent-install-${org}.crt`)) {
        // todo cp to agent-install.crt
        this.copyFile(`sudo cp ${this.etcHorizon}/agent-install-${org}.crt ${this.etcHorizon}/agent-install.crt`).then(() => {
          observer.complete()
        })
      } else {
        let arg = `sudo curl -sSL -u "${pEnv.getOrgId()}/${pEnv.getExchangeUserAuth()}" --insecure -o "${this.etcHorizon}/agent-install-${org}.crt" ${pEnv.getFSSCSSUrl()}/api/v1/objects/IBM/agent_files/agent-install.crt/data`
        this.shell(arg, 'done updating cert', 'failed to update cert')
        .subscribe({
          complete: () => {
            // todo cp to agent-install.crt
            this.copyFile(`sudo cp ${this.etcHorizon}/agent-install-${org}.crt ${this.etcHorizon}/agent-install.crt`).then(() => {
              observer.complete()
            })  
          }, error: (err: any) => observer.error(err)
        })
      }
    })  
  }
  tokenReplace(template: string, obj: any) {
    //  template = 'Where is ${movie} playing?',
    //  tokenReplace(template, {movie: movie});
    return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, (match, key) => {
      return obj[key];
    });
  }
  writeHorizon(content: string) {
    return new Observable((observer) => {
      this.copyFile(`sudo cp ${this.etcDefault}/horizon ${this.etcDefault}/.horizon`).then(() => {
        writeFileSync('.horizon', content);
        this.copyFile(`sudo mv .horizon ${this.etcDefault}/horizon`).then(() => {
          observer.next();
          observer.complete();  
        })
      })
    })  
  }
  nameValueToJson(file: string) {
    let ar = readFileSync(file).toString().split('\n');
    let json = Object.assign({})
    ar.forEach((el: string) => {
      let prop = el.split('=')
      json[prop[0]] = prop[1]
    })
    return json;
  }
  updateHznInfo() {
    return new Observable((observer) => {
      let props = this.getPropsFromFile(`${this.etcDefault}/horizon`);
      console.log('\nKey in new value or (leave blank) press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        console.log(result)

        console.log('\nWould you like to update horizon: Y/n?')
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            let content = '';
            for(const [key, value] of Object.entries(result)) {
              content += `${key}=${value}\n`; 
            }
            this.copyFile(`sudo cp ${this.etcDefault}/horizon ${this.etcDefault}/.horizon`).then(() => {
              writeFileSync('.horizon', content);
              this.copyFile(`sudo mv .horizon ${this.etcDefault}/horizon`).then(() => {
                observer.next();
                observer.complete();  
              })
            })
          } else {
            observer.complete();
          }
        })
      })
    })  
  }
  policyToProps(policy: string) {
    let props: any = {};
    let keys = Object.keys(policy);
    keys.forEach((key) => {
      props[key] = [];
      policy[key].forEach((el: any, i: number) => {
        if(key === 'properties') {
          props[key].push({name: el.name, value: el.value})
        } else {
          props[key].push({value: el})
        }
      })
    })
    console.dir(props, {depth: null, colors: true})  
    return props;
  }
  promptType(propName: string, res: any, el: any) {
    let name: string; 
    let value: string;
    if(propName === 'properties' || propName === 'environment variable') {
      name = promptSync(`name (${el.name}): `, {value: el.name});
      value = promptSync(`value (${el.value}): `, {value: el.value});
      if(typeof value == 'string' ? name.trim().length > 0 && value.trim().length > 0 : name.trim().length > 0) {
        if(propName === 'properties') {
          res.push({name: name, value: value})  
        } else {
          res[name] = value
        }
      }            
    } else {
      console.dir(el, {depth: null, color: true})
      value = promptSync(`constraint (${el.value}): `, {value: el.value});
      if(value && value.trim().length > 0) {
        res.push(value)
      }
    }
  }
  goPrompt(props: any, propName: string) {
    return new Promise(async (resolve, reject) => {
      let res: any = [];
      let name: string; 
      let value: string;
      let answer: string;
      if(propName == 'properties') {
        Object.values(props).forEach((el: any) => {
          this.promptType(propName, res, el)
        })  
      } else {
        props.forEach((el: any) => {
          this.promptType(propName, res, el)
        })
      }
      const template = propName == 'properties' ? {name: '', value: ''} : {value: ''}
      do {
        answer = promptSync(`Would you like to add additional ${propName}: Y/n? `)
        if(answer.toLowerCase() == 'y') {
          this.promptType(propName, res, template)
        }  
      } while(answer.toLowerCase() == 'y')
      resolve(res)   
    })
  }
  unregisterAgent() {
    return new Observable((observer) => {
      utils.isNodeConfigured()
      .subscribe({
        next: (res) => {
          if(res) {
            let arg = `hzn unregister -frDv`;
            utils.shell(arg, 'done unregistering agent', 'failed to unregister agent')
            .subscribe({
              next: (res) => observer.complete(),
              error: (e) => observer.error(e)
            })      
          } else {
            console.log('no need to unregister...')
            observer.complete()
          }
        }, error(e) {
          observer.complete()
        }
      })
    })  
  }
  promptEditPolicy() {

  }
  addPolicy(param: IHznParam, policy: any) {
    return new Observable((observer) => {
      let answer = this.promptPolicySelection(`Please select the type of policy you would like to add: `);
      if(answer == 0) {
        observer.next(0) 
        observer.complete()
      } else if(answer == 1) {
        console.log('\x1b[32m', '\nAdding Service Policy') 
        this.addServicePolicy(policy)
        .subscribe(() => {observer.next(1); observer.complete()})
      } else if(answer == 2) {
        console.log('\x1b[32m', '\nAdding Deployment Policy') 
        this.addDeploymentPolicy(policy)
        .subscribe(() => {observer.next(2); observer.complete()})
      } else if(answer == 3) {
        console.log('\x1b[32m', '\nAdding Node Policy') 
        this.addNodePolicy(param, policy)
        .subscribe(() => {observer.next(3); observer.complete()})
      } else if(answer == 4) {
        console.log('\x1b[32m', '\nAdding Object Policy')
        this.addObjectPolicy(param)
        .subscribe(() => {observer.next(4); observer.complete()})
      }
    })  
  }
  addDeploymentPolicy(policy: any) {
    let arg = `hzn exchange deployment addpolicy -f ${policy.deploymentPolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/policy-${policy.envVar.getEnvValue('SERVICE_NAME')}_${policy.envVar.getEnvValue('SERVICE_VERSION')}_${policy.envVar.getEnvValue('ARCH')}`
    return utils.shell(arg)
  }
  addServicePolicy(policy: any) {
    let arg = `hzn exchange service addpolicy -f ${policy.servicePolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/${policy.envVar.getEnvValue('SERVICE_NAME')}_${policy.envVar.getEnvValue('SERVICE_VERSION')}_${policy.envVar.getEnvValue('ARCH')}`
    return utils.shell(arg)
  }
  addObjectPolicy(param: IHznParam) {
    let arg = `hzn mms object publish -m ${param.policy.objectPolicyJson} -f ${param.objectFile}`
    return utils.shell(arg, 'done publishing object', 'failed to publish object', false);
  }
  addNodePolicy(param: IHznParam, policy: any) {
    return new Observable((observer) => {
      this.unregisterAgent().subscribe({
        complete: () => {
          let arg = param.name.length > 0 ? `hzn register --policy ${policy.nodePolicyJson} --name ${param.name}` : `hzn register --policy ${policy.nodePolicyJson}`
          utils.shell(arg, 'done registering agent with policy', 'failed to register agent')
          .subscribe({
            complete: () => observer.complete(),
            error: (err) => observer.error(err)
          })
        }, error: (err) => {
          observer.error(err);
        }    
      })  
    })  
  }
  addRemoteNodePolicy(param: IHznParam, policy: any) {
    return new Observable((observer) => {
      let arg = `hzn register --policy ${policy.nodePolicyJson} --name ${param.name}`
      utils.shell(arg, 'done registering remote agent with policy', 'failed to register remote agent')
      .subscribe({
        complete: () => observer.complete(),
        error: (err) => observer.error(err)
      })
    })
  }
  promptPolicySelection(msg: string = `Please select the type of policy you would like to work with: `) {
    let answer;
    console.log('\x1b[36m', `\nType of policies:\n1) Service Policy\n2) Deployment Policy\n3) Node Policy\n4) Object Policy\n0) To exit`)
    do {
      answer = parseInt(promptSync(msg))
      if(answer < 0 || answer > 4) {
        console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.')
      } 
    } while(answer < 0 || answer > 4)
    return answer
  }
  promptServiceSelection() {
    let answer;
    console.log('\x1b[36m', `\nType of service definitions:\n1) Top Level Service\n2) Dependent Service\n0) To exit`)
    do {
      answer = parseInt(promptSync(`Please make your selection: `))
      if(answer < 0 || answer > 4) {
        console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.')
      } 
    } while(answer < 0 || answer > 4)
    return answer
  }
  reviewServiceDefinition() {    
    return new Observable((observer) => {
      let answer = this.promptServiceSelection();
      switch(answer) {
        case 0: 
          observer.next(0) 
          observer.complete()
          break;
        case 1:
          console.log('\x1b[32m', '\nReview Top Level Service Definition') 
          this.displayFileContent(`services/top-level-service/service.definition.json`)
          observer.next(1); observer.complete()
          break;
        case 2:  
          console.log('\x1b[32m', '\nReview Dependent Service Definition') 
          this.displayFileContent(`services/dependent-service/service.definition.json`)
          observer.next(2); observer.complete()
          break;
      }
    })  
  }
  reviewPolicy() {    
    return new Observable((observer) => {
      let answer = this.promptPolicySelection();
      switch(answer) {
        case 0: 
          observer.next(0) 
          observer.complete()
          break;
        case 1:
          console.log('\x1b[32m', '\nReview Service Policy') 
          this.displayFileContent('service.policy.json')
          observer.next(1); observer.complete()
          break;
        case 2:  
          console.log('\x1b[32m', '\nReview Deployment Policy') 
          this.displayFileContent('deployment.policy.json')
          observer.next(2); observer.complete()
          break;
        case 3:  
          console.log('\x1b[32m', '\nReview Node Policy') 
          this.displayFileContent('node.policy.json')
          observer.next(3); observer.complete()
          break;
        case 4:  
          console.log('\x1b[32m', '\nReview Object Policy') 
          this.displayFileContent('object.policy.json')
          observer.next(4); observer.complete()
          break;
      }
    })  
  }
  displayFileContent(filename: string) {
    let policy = this.getJsonFromFile(filename);
    console.dir(policy, {depth: null, colors: true})
  }
  editPolicy() {
    return new Observable((observer) => {
      let answer = this.promptPolicySelection();
      switch(answer) {
        case 0: 
          observer.next(0) 
          observer.complete()
          break;
        case 1:
          console.log('\x1b[32m', '\nWorking with Service Policy') 
          this.editServicePolicy()
          .subscribe(() => {observer.next(1); observer.complete()})
          break;
        case 2:  
          console.log('\x1b[32m', '\nWorking with Deployment Policy') 
          this.editDeploymentPolicy()
          .subscribe(() => {observer.next(2); observer.complete()})
          break;
        case 3:  
          console.log('\x1b[32m', '\nWorking with Node Policy') 
          this.editNodePolicy()
          .subscribe(() => {observer.next(3); observer.complete()})
          break;
        case 4:  
          console.log('\x1b[32m', '\nWorking with Object Policy') 
          this.editObjectPolicy()
          .subscribe(() => observer.complete())
          break;
      }
    })  
  }
  editObjectPolicy() {
    return this.editTypePolicy('object.policy.json')
  }
  editNodePolicy() {
    return this.editTypePolicy('node.policy.json')
  }
  editDeploymentPolicy() {
    return new Observable((observer) => {
    })  
  }
  editServicePolicy() {
    return this.editTypePolicy('service.policy.json')
  }
  getJsonFromFile(jsonFile: string) {
    let json;
    console.log(`${this.hznConfig}/${jsonFile}`)
    if(existsSync(`${this.hznConfig}/${jsonFile}`)) {
      try {
        json = jsonfile.readFileSync(`${this.hznConfig}/${jsonFile}`);
      } catch(e) {
        console.log(e)
        json = jsonfile.readFileSync(`${__dirname}/config/${jsonFile}`)
      }
    } else {
      console.log('notfound')
      json = jsonfile.readFileSync(`${__dirname}/config/${jsonFile}`)
    }
    return json
  }
  editTypePolicy(filename: string) {
    return new Observable((observer) => {
      let policy = this.getJsonFromFile(filename);
      console.dir(policy, {depth: null, colors: true})
      console.log(`\nWould you like to make changes to this policy: Y/n?`)
      prompt.get({name: 'answer', required: true}, async (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          let props = this.policyToProps(policy);
          console.log('\nKey in new value or (leave blank) press Enter to keep current value or enter blank space(s) to omit: ')
          let keys = Object.keys(props);
          let res = {};
          for(const key of keys) {
            console.log('\x1b[32m', `${key}\n`)
            // console.dir(`${key} ${props[key]}\n`)
            res[key] = await this.goPrompt(props[key], key)
          }
          console.dir(res, {depth: null, colors: true})
          console.log(`\nWould you like to save this policy: Y/n?`)
          prompt.get({name: 'answer', required: true}, async (err: any, question: any) => {
            if(question.answer.toUpperCase() === 'Y') {
              jsonfile.writeFileSync(`${this.hznConfig}/${filename}`, res, {spaces: 2});
            }
            observer.next()
            observer.complete()
          })
        } else {
          observer.next()
          observer.complete()
        }    
      })  
    })
  }
  isNodeConfigured() {
    return new Observable((observer) => {
      let arg = `hzn node list`
      this.shell(arg)
      .subscribe({
        next: (res: any) => {
          console.log(typeof res == 'string')
          try {
            let json = JSON.parse(res)
            console.log(json.configstate.state)
            observer.next(json.configstate.state === 'configured')
            observer.complete()
          } catch(e) {
            observer.error(e)
          }
        }, error(e) {
          observer.error(e)
        }
      })
    })  
  }
  shell(arg: string, success='command executed successfully', error='command failed', prnStdout=true, options={maxBuffer: 1024 * 2000}) {
    return new Observable((observer) => {
      console.log(arg);
      let child = exec(arg, options, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          // console.log(stdout);
          console.log(success);
          observer.next(prnStdout ? stdout : '');
          observer.complete();
        } else {
          console.log(`${error}: ${err}`);
          observer.error(err);
        }
      });
      child.stdout.pipe(process.stdout);
      child.on('data', (data) => {
        console.log(data)
      })  
    });
  }
}