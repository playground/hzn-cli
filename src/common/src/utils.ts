import { Observable, of, firstValueFrom, forkJoin, from } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;
import { readFileSync, writeFileSync, copyFileSync , existsSync, exists } from 'fs';
import os from 'os';
const ifs: any = os.networkInterfaces();
import prompt from 'prompt';
const promptSync = require('prompt-sync')();
import jsonfile from 'jsonfile';
import { utils } from '.';
import { fork } from 'child_process';

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
  "UPDATE_FILE_NAME"
];

export class Utils {
  etcDefault = '/etc/default';
  homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  hznConfig = `${this.homePath}/hzn-config`;
  constructor() {}
  init() {
  }
  getHznConfig() {
    return this.hznConfig
  }
  listService(name: string) {
    const arg = name.length > 0 ? `hzn exchange service list ${name}` : 'hzn exchange service list';
    return this.shell(arg);
  }
  listPattern(name: string) {
    const arg = name.length > 0 ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
    return this.shell(arg);
  }
  listNode(name: string) {
    const arg = name.length > 0 ? `hzn exchange node list ${name}` : 'hzn exchange node list';
    return this.shell(arg);
  }
  listObject(name: string) {
    const arg = name.length > 0 ? `hzn mms object list ${name}` : 'hzn mms object list';
    return this.shell(arg);
  }
  listDeploymentPolicy(name: string) {
    const arg = name.length > 0 ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
    return this.shell(arg);
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
    return this.shell(`hzn node list | jq .configstate.state`);  
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
  installHznCli(anax: string, id: null) {
    let nodeId = id ? `-d ${id}` : '';
    if(anax && anax.indexOf('open-horizon') > 0) {
      // NOTE: for Open Horizon anax would be https://github.com/open-horizon/anax/releases/latest/download/agent-install.sh
      return this.shell(`curl -sSL ${anax} | yes | sudo -s -E bash -s -- -i anax: -k css: -c css: -p IBM/pattern-ibm.helloworld -w '*' -T 120`)
    } else {
      return this.shell(`curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/${anax} && chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -i 'css:' ${nodeId}`)
    }  
  }
  uninstallHorizon() {
    return new Observable((observer) => { 
      console.log(`\nWould you like to proceed to uninstall Horzion: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          let arg = `sudo apt purge -y bluehorizon horizon horizon-cli`
          if(process.platform == 'darwin') {
            arg = `yes | sudo /Users/Shared/horizon-cli/bin/horizon-cli-uninstall.sh && sudo pkgutil --forget com.github.open-horizon.pkg.horizon-cli`
          }  
          this.shell(arg)
          .subscribe({
            complete: () => {
              this.shell(`rm -rf ${this.homePath}/.hzn`)
              .subscribe({
                complete: () => observer.complete(),
                error: (err) => observer.error(err)    
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
  updateEnvFiles(org: string) {
    return new Observable((observer) => { 
      let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
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
      
            console.log(`\nWould you like to update config files: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              let content = '';
              for(const [key, value] of Object.entries(result)) {
                content += `${key}=${value}\n`; 
              }
              writeFileSync('.env-local', content);
              this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
                this.updateEnvHzn(org)
                .subscribe({
                  complete: () => observer.complete(),
                  error: (err) => observer.error(err)
                })
              })  
            })
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
            console.log(`config files is not setup for ${org}`);
            observer.error(`config files is not setup for ${org}`)
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
      name = promptSync(`name (${el.name}): `, {value: el.name}).trim();
      value = promptSync(`value (${el.value}): `, {value: el.value}).trim();
      if(name.length > 0 && value.length > 0) {
        if(propName === 'properties') {
          res.push({name: name, value: value})  
        } else {
          res[name] = value
        }
      }            
    } else {
      console.dir(el, {depth: null, color: true})
      value = promptSync(`constraint (${el.value}): `, {value: el.value}).trim();
      if(value.length > 0) {
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
  editPolicy() {
    return new Observable((observer) => {
      let answer;
      console.log('\x1b[36m', `\nType of policies:\n1) Node Policy\n2) Deployment Policy\n3) Service Policy\n0) To exit`)
      do {
        answer = parseInt(promptSync(`Please select the type of policy you would like to work with: `))
        if(answer < 0 || answer > 3) {
          console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.')
        } 
      } while(answer < 0 || answer > 3)
      switch(answer) {
        case 0: 
          observer.complete()
          break;
        case 1:
          console.log('\x1b[32m', '\nWorking with Node Policy') 
          this.editNodePolicy()
          .subscribe(() => observer.complete())
          break;
        case 2:  
          console.log('\x1b[32m', '\nWorking with Deployment Policy') 
          this.editDeploymentPolicy()
          .subscribe(() => observer.complete())
          break;
        case 3:  
          console.log('\x1b[32m', '\nWorking with Service Policy') 
          this.editServicePolicy()
          .subscribe(() => observer.complete())
          break;
      }
    })  
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
              observer.complete()
            }
          })
        } else {
          observer.complete()
        }    
      })  
    })
  }
  shell(arg: string, success='command executed successfully', error='command failed', options={maxBuffer: 1024 * 3000}) {
    return new Observable((observer) => {
      console.log(arg);
      let child = exec(arg, options, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          // console.log(stdout);
          console.log(success);
          observer.next(stdout);
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
