import { Observable, forkJoin } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;
import { readFileSync, writeFileSync } from 'fs';
import { Env } from './env';
import { Utils } from './utils';
const prompt = require('prompt');

const utils = new Utils();

export class Hzn {
  objectType: any;
  objectId: any;
  objectFile: any;
  pattern: any;
  serviceJson: any;
  patternJson: any;
  policyJson: any;
  mmsPattern: any;
  mmsServiceJson: any;
  mmsPatternJson: any;
  mmsPolicyJson: any;
  envVar: any;
  utils = new Utils();
  constructor(env:string) {
    this.envVar = new Env(env);
  }

  setup() {
    return new Observable((observer) => {
      this.envVar.init()
      .subscribe({
        complete: () => {
          this.objectType = process.env.npm_config_type || this.envVar.getMMSObjectType();
          this.objectId = process.env.npm_config_id || this.envVar.getMMSObjectId();
          this.objectFile = process.env.npm_config_object || this.envVar.getMMSObjectFile();
          this.mmsPattern = process.env.npm_config_pattern || this.envVar.getMMSPatterName();
          this.patternJson = process.env.npm_config_patternjson || 'config/service/pattern.json';
          this.serviceJson = process.env.npm_config_servicejson || 'config/service/service.json';
          this.policyJson = process.env.npm_config_policyjson || 'config/service/policy.json';
          this.mmsPatternJson = process.env.npm_config_patternjson || 'config/mms/pattern.json';
          this.mmsServiceJson = process.env.npm_config_servicejson || 'config/mms/service.json';
          this.mmsPolicyJson = process.env.npm_config_policyjson || 'config/mms/policy.json';
          observer.complete();    
        },
        error: (err) => {
          console.log(err);
          if(err.indexOf('hzn: not found')) {
            console.log('need to install hzn');
            this.installHznCli();
          } else {
            observer.error(err);
          }
        } 
      })
    });      
  }
  test() {
    return new Observable((observer) => {
      console.log(`it works...${this.envVar.getArch()}`)
      observer.complete();
    });  
  }
  buildMMSImage() {
    return new Observable((observer) => {
      // let tag = `${this.envVar.getDockerImageBase()}_${this.envVar.getArch()}:${this.envVar.getMMSServiceVersion()}`;
      let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile.${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
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
      let arg = `docker push ${this.envVar.getMMSContainer()}`;
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
      let arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson}`;
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
      let arg = `hzn exchange pattern publish -f ${this.mmsPatternJson}`;
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
      let arg = `hzn register --policy ${this.mmsPolicyJson} --pattern "${this.mmsPattern}"`;
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
      let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.mmsPattern}`
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
      let arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceJson} --pull-image`;
      console.log(arg)
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          console.log(stdout)
          console.log(`done publishing ${this.envVar.getServiceName()} service`);
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
          console.log(`done publishing ${this.envVar.getPatterName()} pattern`);
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
      utils.aptUpate()
      .subscribe({
        complete: () => {
          utils.installPrereq()
          .subscribe({
            complete: () => {
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
            },
            error: (err) => {
              console.log(err);
            }
          })
        },
        error: (err) => {
          console.log(err);
        }
      })
    });  
  }
}