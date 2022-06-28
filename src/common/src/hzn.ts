import { Observable, of } from 'rxjs';
import { Env } from './env';
import { Utils, promptSync } from './utils';
import { IHznParam, IPolicy, justRun, runDirectly, promptForUpdate } from './interface'
import { existsSync } from 'fs';

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

  nodePolicyJson: string = '';
  deploymentPolicyJson: string = '';
  servicePolicyJson: string = '';
  objectPolicyJson: string = '';
  serviceDefinitionJson: string = '';
  servicePatternJson: string = '';
  envVar: any;
  configPath: string;
  name: string;
  org: string;
  param: IHznParam;
  utils: Utils;

  constructor(param: IHznParam) {
    this.utils = utils;
    this.param = param;
    this.org = param.org;
    this.envVar = new Env(param.org, utils.getHznConfig());
    this.configPath = param.configPath;
    this.name = param.name;
    this.objectType = param.objectType;
    this.objectId = param.objectId;
    this.objectFile = param.objectFile;
    this.mmsPattern = param.mmsPattern;
  }

  init() {
    return new Observable((observer) => {
      this.envVar.init()
      .subscribe({
        complete: () => {
          this.param.objectType = this.objectType = this.objectType || this.envVar.getMMSObjectType();
          this.param.objectId = this.objectId = this.objectId || this.envVar.getMMSObjectId();
          this.param.objectFile = this.objectFile = this.objectFile || this.envVar.getMMSObjectFile();
          this.param.mmsPattern = this.mmsPattern = this.mmsPattern || this.envVar.getMMSPatterName();

          this.patternJson = `${this.configPath}/services/dependent-service/service.pattern.json`;
          this.serviceJson = `${this.configPath}/services/dependent-service/service.definition.json`;
          this.policyJson = `${this.configPath}/service/policy.json`;
          this.mmsPatternJson = `${this.configPath}/services/top-level-service/service.pattern.json`;
          this.mmsServiceJson = `${this.configPath}/services/top-level-service/service.definition.json`;
          this.mmsPolicyJson = `${this.configPath}/mms/policy.json`;

          this.nodePolicyJson = `${this.configPath}/node.policy.json`;
          this.deploymentPolicyJson = `${this.configPath}/deployment.policy.json`;
          this.servicePolicyJson = `${this.configPath}/service.policy.json`;
          this.objectPolicyJson = `${this.configPath}/object.policy.json`;

          this.param.policy = this.getPolicyInfo()
          
          if(promptForUpdate.indexOf(this.param.action) >= 0) {
            utils.switchEnvironment(this.org)
            .subscribe(() => {
              observer.complete()
            })  
          } else {
            observer.complete()
          }
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
      console.log(`it works..., your environment is ready to go!`)
      observer.complete();
    });  
  }
  setup() {
    return new Observable((observer) => {
      console.log(`it works..., your environment is ready to go!`)
      observer.complete();
    });  
  }
  appendSupport() {
    return utils.appendSupport()
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
    let dockerFile = `Dockerfile-mms-${this.envVar.getArch()}`.replace(/\r?\n|\r/g, '')
    let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
    if(!existsSync(`./${dockerFile}`)) {
      arg = `docker build -t ${this.envVar.getMMSContainer()} -f ${__dirname}/hzn-config/setup/${dockerFile} ${__dirname}/hzn-config/setup`.replace(/\r?\n|\r/g, '');
    }
    // let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
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
    return utils.unregisterAgent()
  }
  registerAgent() {
    return new Observable((observer) => {
      this.unregisterAgent().subscribe({
        complete: () => {
          let arg = `hzn register --policy ${this.nodePolicyJson} --pattern "${this.mmsPattern}"`;
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
  publishMMSObjectPolicy() {
    let arg = `hzn mms object publish -m ${this.objectPolicyJson} -f ${this.objectFile}`
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
          this.publishMMSService().subscribe({
            complete: () => {
              this.publishPattern().subscribe({
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
  publishAndRegister() {
    return new Observable((observer) => {
      this.publishServiceAndPattern().subscribe({
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
    });
  }
  getPolicyInfo() {
    let policyInfo: IPolicy = {
      envVar: this.envVar,
      nodePolicyJson: this.nodePolicyJson,
      servicePolicyJson: this.servicePolicyJson,
      objectPolicyJson: this.objectPolicyJson,
      deploymentPolicyJson: this.deploymentPolicyJson
    }
    return policyInfo
  }
  reviewServiceDefinition() {
    return utils.reviewServiceDefinition()
  }
  reviewPolicy() {
    return utils.reviewPolicy()
  }
  editPolicy() {
    return utils.editPolicy()
  }
  editDeploymentPolicy() {

  }
  editNodePolicy() {
    return utils.editNodePolicy()
  }
  editServicePolicy() {
    return utils.editServicePolicy()
  }
  addPolicy() {
    return utils.addPolicy(this.param, this.getPolicyInfo())
  }
  addDeploymentPolicy() {
    return utils.addDeploymentPolicy(this.getPolicyInfo())
  }
  addServicePolicy() {
    return utils.addServicePolicy(this.getPolicyInfo())
  }
  addNodePolicy() {
    return utils.addNodePolicy(this.param, this.getPolicyInfo())
  }
  addRemoteNodePolicy() {
    return this.param.name.length > 0 ? utils.addRemoteNodePolicy(this.param, this.getPolicyInfo()) : of('Please specify remote node name')    
  }
  showHznInfo() {
    return utils.showHznInfo();
  }
  updateHznInfo() {
    return utils.updateHznInfo();
  }
  listAgreement() {
    return utils.listAgreement(this.param);
  }
  listService() {
    return utils.listService(this.param);
  }
  listAllServices() {
    return utils.listAllServices(this.param);
  }
  isConfigured() {
    return utils.isNodeConfigured()
  }
  listPattern() {
    return utils.listPattern(this.name);
  }
  listNode() {
    return utils.listNode(this.param);
  }
  listExchangeNode() {
    return utils.listExchangeNode(this.param);
  }
  removeNode() {
    return this.param.name.length > 0 ? utils.removeNode(`${this.param.org}/${this.param.name}`) : of('Please specify node name')
  }
  listObject() {
    return utils.listObject(this.param);
  }
  listPolicy() {
    return utils.listPolicy()
  }
  listExchangeNodePolicy() {
    return this.param.name.length > 0 ? utils.listExchangeNodePolicy(this.param) : of('Please specify node name')    
  }
  listServicePolicy() {
    return this.param.name.length > 0 ? utils.listServicePolicy(`${this.param.org}/${this.param.name}`) : of('Please specify service policy name')    
  }
  listDeploymentPolicy() {
    return utils.listDeploymentPolicy(this.param.name);
  }
  removeDeploymentPolicy() {
    return this.param.name.length > 0 ? utils.removeDeploymentPolicy(`${this.param.org}/${this.param.name}`) : of('Please specify deployment policy name')    
  }
  deleteObject() {
    return new Observable((observer) => {
      let arg = `hzn mms object delete -t ${this.objectType} -i ${this.objectId} -d`
      utils.shell(arg, 'done deleting object', 'failed to delete object')
      .subscribe(() => {
        // delete twice deletes right away
        utils.shell(arg, 'done deleting object', 'failed to delete object')
        .subscribe(() => observer.complete())
      })  
    })
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
    return utils.installHznCli(this.envVar.getAnax(), this.envVar.getHznNodeID(), this.envVar.getHznCSS() !== 'false');
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