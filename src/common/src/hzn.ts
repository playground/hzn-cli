import { Observable, forkJoin } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;
import { readFileSync, writeFileSync } from 'fs';
import { Env } from './env';
import { Utils } from './utils';
const prompt = require('prompt');

const envVar = new Env();
const utils = new Utils();

export class Hzn {
  objectType: any;
  objectId: any;
  objectFile: any;
  pattern: any;
  serviceJson: any;
  patternJson: any;
  policyJson: any;
  envVar = new Env();
  utils = new Utils();
  constructor() {}

  setup() {
    return new Observable((observer) => {
      envVar.init()
      .subscribe({
        complete: () => {
          this.objectType = process.env.npm_config_type || this.envVar.getMMSObjectType();
          this.objectId = process.env.npm_config_id || this.envVar.getMMSObjectId();
          this.objectFile = process.env.npm_config_object || this.envVar.getMMSObjectFile();
          this.pattern = process.env.npm_config_pattern || this.envVar.getMMSPatterName();
          this.patternJson = process.env.npm_config_patternjson || 'config/mms/pattern.json';
          this.serviceJson = process.env.npm_config_servicejson || 'config/mms/service.json';
          this.policyJson = process.env.npm_config_policyjson || 'config/mms/policy.json';
          observer.complete();    
        },
        error: (err) => {
          observer.error(err);
        } 
      })
    });      
  }
  test() {
    return new Observable((observer) => {
      console.log('it works...')
      observer.complete();
    });  
  }
  buildMMSImage() {
    return new Observable((observer) => {
      // let tag = `${envVar.getDockerImageBase()}_${envVar.getArch()}:${envVar.getMMSServiceVersion()}`;
      let arg = `docker build -t ${envVar.getMMSContainer()} -f Dockerfile.${envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done building docker image`);
        } else {
          console.log('failed to build docker image', err);
        }
        observer.next();
        observer.complete();
      });
    })  
  }
  pushMMSImage() {
    return new Observable((observer) => {
      let arg = `docker push ${envVar.getMMSContainer()}`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing mms service`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish mms service', err);
          observer.error(err);
        }
      });
    })  
  }
  publishMMSService() {
    return new Observable((observer) => {
      let arg = `hzn exchange service publish -O ${envVar.getMMSContainerCreds()} -f ${this.serviceJson}`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing mms service`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish mms service', err);
          observer.error(err);
        }
      });
    })  
  }
  publishMMSPattern() {
    return new Observable((observer) => {
      let arg = `hzn exchange pattern publish -f ${this.patternJson}`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing mss pattern`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish mms pattern', err);
          observer.error(err);
        }
      });
    })  
  }
  agentRun() {
    return new Observable((observer) => {
      let arg = `hzn register --policy ${this.policyJson} --pattern "${this.pattern}"`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done registering mss agent`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to register mms agent', err);
          observer.error(err);
        }
      });
    })  
  }
  publishMMSObject() {
    return new Observable((observer) => {
      let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.pattern}`
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing object`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish object', err);
          observer.error(err);
        }
      });
    })  
  }
  unregisterAgent() {
    return new Observable((observer) => {
      let arg = `hzn unregister -f`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout)
          console.log(`done unregistering mss agent`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to unregister mms agent', err);
          observer.error(err);
        }
      });
    })  
  }
  registerAgent() {
    return new Observable((observer) => {
      this.unregisterAgent().subscribe({
        complete: () => {
          this.buildMMSImage().subscribe({
            complete: () => {
              this.pushMMSImage().subscribe({
                complete: () => {
                  this.publishMMSService().subscribe({
                    complete: () => {
                      this.publishMMSPattern().subscribe({
                        complete: () => {
                          this.agentRun().subscribe({
                            complete: () => {
                              observer.next();
                              observer.complete();
                            }, error: (err) => {
                              observer.error(err);
                            }
                          })
                        }, error: (err) => {
                          observer.error(err);
                        }  
                      })
                    }, error: (err) => {
                      observer.error(err);
                    }
                  })
                }, error: (err) => {
                  observer.error(err);
                }
              })
            }, error: (err) => {
              observer.error(err);
            }    
          })
        }, error: (err) => {
          observer.error(err);
        }    
      })
    });
  }
  publishService() {
    return new Observable((observer) => {
      let arg = `hzn exchange service publish -O ${envVar.getContainerCreds()} -f ${this.serviceJson} --pull-image`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing ${envVar.getServiceName()} service`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish service', err);
          observer.error(err);
        }
      });
    })  
  }
  publishPattern() {
    return new Observable((observer) => {
      let arg = `hzn exchange pattern publish -f ${this.patternJson}`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing ${envVar.getPatterName()} pattern`);
          observer.next();
          observer.complete();
        } else {
          console.log('failed to publish mms pattern', err);
          observer.error(err);
        }
      });
    })  
  }
  showHorizonInfo() {
    return new Observable((observer) => {
      const file = this.getHorizonInfo();
      console.log(file)
      observer.next(file);
      observer.complete();
    })  
  }
  getHorizonInfo() {
    return readFileSync('/etc/default/horizon').toString().split('\n');
  }
  updateHorizonInfo() {
    return new Observable((observer) => {
      let data = this.getHorizonInfo();
      let props: any[] = [];
      data.forEach((el, i) => {
        if(el.length > 0) {
          let prop = el.split('=');
          if(prop && prop.length > 0) {
            props[i] = {name: prop[0], default: prop[1], required: true};
          }  
        }
      });
      console.log('\nKey in new value or press Enter to keep current value: ')
      prompt.get(props, (err: any, result: any) => {
        console.log(result)

        console.log('\nWould like to update horizon: Y/n?')
        prompt.get({name: 'answer', required: true}, (err: any, question: any) => {
          if(question.answer === 'Y') {
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
          }
        })
      })
    })  
  }
  copyFile(arg: string) {
    return new Promise((resolve, reject) => {
      try {
        console.log(arg);
        exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
          if(!err) {
            console.log(`done moving file`);
          } else {
            console.log('failed to move file', err);
          }
          resolve(stdout);
        });       
      } catch(e) {
        console.log(e)
        resolve(e);
      }
    });
  }
  listService() {
    return utils.listService();
  }
  listPattern() {
    return utils.listPattern();
  }
  listNode() {
    return utils.listNode();
  }
  listObject() {
    return utils.listObject();
  }
  listDeploymentPolicy() {
    return utils.listDeploymentPolicy();
  }
  checkConfigState() {
    return utils.checkConfigState();
  }
  listNodePattern() {
    return utils.listNodePattern();
  }
  getDeviceArch() {
    return utils.getDeviceArch();
  }
  createHznKey() {
    return utils.createHznKey();
  }
  installHznCli() {
    return new Observable((observer) => {
      utils.installHznCli()
      .subscribe({
        complete: () => {
          utils.createHznKey()
          .subscribe({
            complete: () => {
              observer.complete();
            }
          })
        }
      })
    });  
  }
}