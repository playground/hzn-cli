import { Observable } from 'rxjs';
import { Env } from './env';
import { Utils } from './utils';

export const utils = new Utils();

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
  configPath: string;
  name: string;
  constructor(env: string, configPath: string, name: string, objectType: string, objectId: string, objectFile: string, mmsPattern: string) {
    this.envVar = new Env(env, utils.getHznConfig());
    this.configPath = configPath;
    this.name = name;
    this.objectType = objectType;
    this.objectId = objectId;
    this.objectFile = objectFile;
    this.mmsPattern = mmsPattern;
  }

  init() {
    return new Observable((observer) => {
      this.envVar.init()
      .subscribe({
        complete: () => {
          this.objectType = this.objectType || this.envVar.getMMSObjectType();
          this.objectId = this.objectId || this.envVar.getMMSObjectId();
          this.objectFile = this.objectFile || this.envVar.getMMSObjectFile();
          this.mmsPattern = this.mmsPattern || this.envVar.getMMSPatterName();
          this.patternJson = `${this.configPath}/service/pattern.json`;
          this.serviceJson = `${this.configPath}/service/service.json`;
          this.policyJson = `${this.configPath}/service/policy.json`;
          this.mmsPatternJson = `${this.configPath}/mms/pattern.json`;
          this.mmsServiceJson = `${this.configPath}/mms/service.json`;
          this.mmsPolicyJson = `${this.configPath}/mms/policy.json`;
          observer.complete();    
        },
        error: (err) => {
          console.log(err.message);
          if(err.message.indexOf('hzn:') >= 0) {
            console.log('need to install hzn');
            this.preInstallHznCli()
            .subscribe({
              complete: () => {
                console.log('done installing hzn cli.');
                observer.complete();
              },
              error: (err) => {
                observer.error(err);
              }
            })
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
  setup() {
    return new Observable((observer) => {
      console.log(`it works...${this.envVar.getArch()}, your environment is ready to go!`)
      observer.complete();
    });  
  }
  buildServiceImage() {
    let arg = `docker build -t ${this.envVar.getServiceContainer()} -f Dockerfile-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
    return utils.shell(arg, 'done building service docker image', 'failed to build service docker image');
  }
  pushServiceImage() {
    let arg = `docker push ${this.envVar.getServiceContainer()}`;
    return utils.shell(arg, 'done pushing service docker image', 'failed to push service docker image');
  }
  buildMMSImage() {
    let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
    return utils.shell(arg, 'done building mms docker image', 'failed to build mms docker image');
  }
  pushMMSImage() {
    let arg = `docker push ${this.envVar.getMMSContainer()}`;
    return utils.shell(arg, 'done pushing mms docker image', 'failed to push mms docker image');
  }
  pullDockerImage() {
    let image = this.name ? this.name : this.envVar.getServiceContainer()
    let arg = `docker pull ${image}`;
    return utils.shell(arg, 'done pulling docker image', 'failed to pull docker image');
  }
  dockerImageExists() {
    let image = this.name ? this.name : this.envVar.getMMSContainer()
    let arg = `docker images ${image}`;
    // return utils.shell(arg, 'done checking docker image', 'failed to check docker image');
    return new Observable((observer) => {
      utils.shell(arg, 'done checking docker image', 'failed to check docker image')
      .subscribe({
        next: (res) => {
          console.log(res)
          const imageName = image.split(':')
          // @ts-ignore
          let exist = res.indexOf(imageName[0]) > 0 && res.indexOf(imageName[1]) > 0;
          observer.next(exist)
          observer.complete()
        }
      })
    })
  }
  publishService() {
    let arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceJson} --pull-image`;
    return utils.shell(arg, 'done publishing service', 'failed to publish service');
  }
  publishPattern() {
    let arg = `hzn exchange pattern publish -f ${this.patternJson}`;
    return utils.shell(arg, 'done publishing service pattern', 'failed to publish service pattern');
  }
  publishMMSService() {
    let arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson} --pull-image`;
    return utils.shell(arg, 'done publishing mms service', 'failed to publish mms service');
  }
  publishMMSPattern() {
    let arg = `hzn exchange pattern publish -f ${this.mmsPatternJson}`;
    return utils.shell(arg, 'done publishing mss pattern', 'failed to publish mms pattern');
  }
  unregisterAgent() {
    let arg = `hzn unregister -f`;
    return utils.shell(arg, 'done unregistering agent', 'failed to unregister agent');
  }
  registerAgent() {
    return new Observable((observer) => {
      this.unregisterAgent().subscribe({
        complete: () => {
          let arg = `hzn register --policy ${this.mmsPolicyJson} --pattern "${this.mmsPattern}"`;
          utils.shell(arg, 'done registering agent', 'failed to register agent')
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
  publishMMSObject() {
    let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.mmsPattern}`
    return utils.shell(arg, 'done publishing object', 'failed to publish object');
  }
  buildAndPublish() {
    return new Observable((observer) => {
      this.buildServiceImage().subscribe({
        complete: () => {
          this.pushServiceImage().subscribe({
            complete: () => {
              this.buildMMSImage().subscribe({
                complete: () => {
                  this.pushMMSImage().subscribe({
                    complete: () => {
                      this.publishServiceAndPattern().subscribe({
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
    });
  }
  publishServiceAndPattern() {
    return new Observable((observer) => {
      this.publishService().subscribe({
        complete: () => {
          this.publishPattern().subscribe({
            complete: () => {
              this.publishMMSService().subscribe({
                complete: () => {
                  this.publishMMSPattern().subscribe({
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
    });
  }
  buildPublishAndRegister() {
    return new Observable((observer) => {
      this.buildAndPublish().subscribe({
        complete: () => {
          this.publishServiceAndPattern().subscribe({
            complete: () => {
              this.unregisterAgent().subscribe({
                complete: () => {
                  this.registerAgent().subscribe({
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
    });    
  }
  publishAndRegister() {
    return new Observable((observer) => {
      this.publishServiceAndPattern().subscribe({
        complete: () => {
          this.unregisterAgent().subscribe({
            complete: () => {
              this.registerAgent().subscribe({
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
    });
  }
  showHznInfo() {
    return utils.showHznInfo();
  }
  updateHznInfo() {
    return utils.updateHznInfo();
  }
  listService() {
    return utils.listService(this.name);
  }
  listPattern() {
    return utils.listPattern(this.name);
  }
  listNode() {
    return utils.listNode(this.name);
  }
  listObject() {
    return utils.listObject(this.name);
  }
  listDeploymentPolicy() {
    return utils.listDeploymentPolicy(this.name);
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
    return utils.createHznKey(this.envVar.getOrgId(), this.envVar.getMyDockerHubId());
  }
  aptUpdate() {
    return utils.aptUpdate();
  }
  installPrereq() {
    return utils.installPrereq();
  }
  installHznCli() {
    return utils.installHznCli(this.envVar.getAnax(), this.envVar.getHznNodeID());
  }
  uninstallHorizon() {
    return utils.uninstallHorizon();
  }
  preInstallHznCli() {
    return new Observable((observer) => {
      this.installPrereq()
      .subscribe({
        complete: () => {
          this.installHznCli()
          .subscribe({
            complete: () => {
              this.createHznKey()
              .subscribe({
                complete: () => {
                  observer.complete();
                },
                error: (err) => {
                  observer.error(err);
                }
              })
            },
            error: (err) => {
              observer.error(err);
            }
          })        
        },
        error: (err) => {
          observer.error(err);
        }
      })
    });  
  }
  setupManagementHub() {
    return utils.setupManagementHub();
  }
  setupRedHat() {
    return new Observable((observer) => {
      utils.checkOS()
      .subscribe({
        next: (stdout:any) => {
          if(stdout.toLowerCase().indexOf('redhat') >= 0) {
            utils.shell(`sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine podman runc 
                        && sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo -y 
                        && sudo yum install docker-ce docker-ce-cli containerd.io`)
            .subscribe({
              complete: () => observer.complete(),
              error: (err) => observer.error(err)
            })
          } else {
            console.log('This is not RHEL')
            observer.complete();
          }
        }
      })
    })
  }
  getIpAddress() {
    return new Observable((observer) => {
      let result = utils.getIpAddress()
      console.log(result)
      observer.complete()
    })  
  }
}