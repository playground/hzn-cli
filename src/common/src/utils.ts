import { Observable, of, firstValueFrom } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;
import { readFileSync, writeFileSync, copyFileSync , existsSync, exists } from 'fs';
import os from 'os';
import prompt from 'prompt';
import jsonfile from 'jsonfile';


const env = process.env.npm_config_env || 'biz';
const notRequired = ['SERVICE_CONTAINER_CREDS', 'MMS_CONTAINER_CREDS', 'MMS_OBJECT_FILE', 'HZN_CUSTOM_NODE_ID', 'UPDATE_FILE_NAME'];

export class Utils {
  hznConfig = '/etc/default/config';
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
    if(anax && anax.length > 0) {
      return this.shell(`curl -sSL ${anax} | sudo -s -E bash -s -- -i anax: -k css: -c css: -p IBM/pattern-ibm.helloworld -w '*' -T 120`)
    } else {
      let nodeId = id ? `-d ${id}` : '';
      return this.shell(`curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/api/v1/objects/IBM/agent_files/agent-install.sh/data && chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -i 'css:' ${nodeId}`)
    }  
  }
  uninstallHorizon() {
    return this.shell(`sudo apt purge -y bluehorizon horizon horizon-cli`);
  }
  copyFile(arg: string) {
    return firstValueFrom(this.shell(arg));
  }
  updateEnvFiles(org: string) {
    return new Observable((observer) => {
      let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
      console.log(props)
      console.log(`\nWould you like to change any of the above properties: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          console.log('\nKey in new value or press Enter to keep current value: ')
          prompt.get(props, (err: any, result: any) => {
            console.log(result)
            console.log(`\nWould you like to update config files: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              let content = '';
              for(const [key, value] of Object.entries(result)) {
                content += `${key}=${value}\n`; 
              }
              writeFileSync('.env-local', content);
              this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local`).then(() => {
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
      for(const [key, value] of Object.entries(envVars)) {
        props[i] = {name: key, default: value, required: notRequired.indexOf(key) < 0};
        i++;
      }
      console.log(props)
      console.log(`\nWould you like to change any of the above properties for ${org}: Y/n?`)
      prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
        if(question.answer.toUpperCase() === 'Y') {
          console.log('\nKey in new value or press Enter to keep current value: ')
          prompt.get(props, (err: any, result: any) => {
            console.log(result)
            console.log(`\nWould you like to save these changes: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              if(question.answer.toUpperCase() === 'Y') {
                for(const [key, value] of Object.entries(result)) {
                  envVars[key] = value;
                }
                jsonfile.writeFileSync('.env-hzn.json', hznJson, {spaces: 2});
                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
                  console.log(`config files updated for ${org}`)
                  observer.complete();
                })
              } else {
                console.log(`config files not updated for ${org}`)
                observer.complete();
              }
            })
          })        
        } else {
          if(newOrg) {
            console.log(`\nWould you like to save config for ${org}: Y/n?`)
            prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
              if(question.answer.toUpperCase() === 'Y') {
                jsonfile.writeFileSync('.env-hzn.json', hznJson, {spaces: 2});
                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
                  console.log(`config files updated for ${org}`)
                  observer.complete();
                })
              } else {
                observer.error(`config files not updated for ${org}`)
              }
            })    
          } else {
            observer.error(`config files not updated for ${org}`)
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
            this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
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
              complete: () => observer.complete(),
              error: (err) => observer.error(err) 
            })
          } else {
            observer.error(`config files not updated for ${org}`);
          }
        })      
      }
    })
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
      console.log('\nKey in new value or press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        console.log(result)
        console.log(`\nWould you like to save config files: Y/n?`)
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            this.copyFile(`sudo cp -rf ${__dirname}/config /etc/default`).then(() => {
              let content = '';
              for(const [key, value] of Object.entries(result)) {
                content += `${key}=${value}\n`; 
              }
              writeFileSync('.env-local', content);
              this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local`).then(() => {
                this.copyFile(`sudo cp ${__dirname}/env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
                  this.orgCheck(org)
                  .subscribe({
                    complete: () => observer.complete(),
                    error: () => observer.complete()
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
      if(existsSync(`${this.hznConfig}/.env-local`) && existsSync(`${this.hznConfig}/.env-hzn.json`)) {
        observer.complete()
      } else {
        observer.error('No config files.')
      }
    })
  }
  getHznInfo() {
    return readFileSync('/etc/default/horizon').toString().split('\n');
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
      let props = this.getPropsFromFile('/etc/default/horizon');
      console.log('\nKey in new value or press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        console.log(result)

        console.log('\nWould you like to update horizon: Y/n?')
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer.toUpperCase() === 'Y') {
            let content = '';
            for(const [key, value] of Object.entries(result)) {
              content += `${key}=${value}\n`; 
            }
            this.copyFile('sudo cp /etc/default/horizon /etc/default/.horizon').then(() => {
              writeFileSync('.horizon', content);
              this.copyFile(`sudo mv .horizon /etc/default/horizon`).then(() => {
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
  shell(arg: string, success='command executed successfully', error='command failed', options={maxBuffer: 1024 * 2000}) {
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
