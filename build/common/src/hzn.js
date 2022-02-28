"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hzn = exports.utils = void 0;
const rxjs_1 = require("rxjs");
const env_1 = require("./env");
const utils_1 = require("./utils");
exports.utils = new utils_1.Utils();
class Hzn {
    constructor(env, configPath, name, objectType, objectId, objectFile, pattern) {
        this.nodePolicyJson = '';
        this.deploymentPolicyJson = '';
        this.servicePolicyJson = '';
        this.serviceDefinitionJson = '';
        this.servicePatternJson = '';
        this.envVar = new env_1.Env(env, exports.utils.getHznConfig());
        this.configPath = configPath;
        this.name = name;
        this.objectType = objectType;
        this.objectId = objectId;
        this.objectFile = objectFile;
        this.pattern = pattern;
    }
    init() {
        return new rxjs_1.Observable((observer) => {
            this.envVar.init()
                .subscribe({
                complete: () => {
                    this.objectType = this.objectType || this.envVar.getObjectType();
                    this.objectId = this.objectId || this.envVar.getObjectId();
                    this.objectFile = this.objectFile || this.envVar.getObjectFile();
                    this.mmsPattern = this.mmsPattern || this.envVar.getMMSPatterName();
                    console.log(`configPath: ${this.configPath}`);
                    this.patternJson = `${this.configPath}/service/pattern.json`;
                    this.serviceJson = `${this.configPath}/service/service.json`;
                    this.policyJson = `${this.configPath}/service/policy.json`;
                    this.mmsPatternJson = `${this.configPath}/mms/pattern.json`;
                    this.mmsServiceJson = `${this.configPath}/mms/service.json`;
                    this.mmsPolicyJson = `${this.configPath}/mms/policy.json`;
                    this.nodePolicyJson = `${this.configPath}/node.policy.json`;
                    this.deploymentPolicyJson = `${this.configPath}/deployment.policy.json`;
                    this.servicePolicyJson = `${this.configPath}/service.policy.json`;
                    if (this.envVar.isTopLevelService()) {
                        this.serviceDefinitionJson = `${this.configPath}/services/top-level-service/service.definition.json`;
                        this.servicePatternJson = `${this.configPath}/services/top-level-service/service.pattern.json`;
                    }
                    else {
                        this.serviceDefinitionJson = `${this.configPath}/services/dependent-service/service.definition.json`;
                        this.servicePatternJson = `${this.configPath}/services/dependent-service/service.pattern.json`;
                    }
                    observer.complete();
                },
                error: (err) => {
                    console.log(err.message);
                    if (err.message.indexOf('hzn:') >= 0) {
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
                        });
                    }
                    else {
                        observer.error(err);
                    }
                }
            });
        });
    }
    test() {
        return new rxjs_1.Observable((observer) => {
            console.log(`it works...${this.envVar.getArch()}`);
            observer.complete();
        });
    }
    setup() {
        return new rxjs_1.Observable((observer) => {
            console.log(`it works...${this.envVar.getArch()}, your environment is ready to go!`);
            observer.complete();
        });
    }
    appendSupport() {
        return exports.utils.appendSupport();
    }
    buildServiceImage() {
        let arg = `docker build -t ${this.envVar.getServiceContainer()} -f Dockerfile-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
        return exports.utils.shell(arg, 'done building service docker image', 'failed to build service docker image');
    }
    pushServiceImage() {
        let arg = `docker push ${this.envVar.getServiceContainer()}`;
        return exports.utils.shell(arg, 'done pushing service docker image', 'failed to push service docker image');
    }
    buildMMSImage() {
        let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
        return exports.utils.shell(arg, 'done building mms docker image', 'failed to build mms docker image');
    }
    pushMMSImage() {
        let arg = `docker push ${this.envVar.getMMSContainer()}`;
        return exports.utils.shell(arg, 'done pushing mms docker image', 'failed to push mms docker image');
    }
    pullDockerImage() {
        let image = this.name ? this.name : this.envVar.getServiceContainer();
        let arg = `docker pull ${image}`;
        return exports.utils.shell(arg, 'done pulling docker image', 'failed to pull docker image');
    }
    dockerImageExists() {
        let image = this.name ? this.name : this.envVar.getMMSContainer();
        let arg = `docker images ${image}`;
        // return utils.shell(arg, 'done checking docker image', 'failed to check docker image');
        return new rxjs_1.Observable((observer) => {
            exports.utils.shell(arg, 'done checking docker image', 'failed to check docker image')
                .subscribe({
                next: (res) => {
                    console.log(res);
                    const imageName = image.split(':');
                    // @ts-ignore
                    let exist = res.indexOf(imageName[0]) > 0 && res.indexOf(imageName[1]) > 0;
                    observer.next(exist);
                    observer.complete();
                }
            });
        });
    }
    publishService() {
        let arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceDefinitionJson} --pull-image`;
        return exports.utils.shell(arg, 'done publishing service', 'failed to publish service');
    }
    publishPattern() {
        let arg = `hzn exchange pattern publish -f ${this.patternJson}`;
        return exports.utils.shell(arg, 'done publishing service pattern', 'failed to publish service pattern');
    }
    publishMMSService() {
        let arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson} --pull-image`;
        return exports.utils.shell(arg, 'done publishing mms service', 'failed to publish mms service');
    }
    publishMMSPattern() {
        let arg = `hzn exchange pattern publish -f ${this.mmsPatternJson}`;
        return exports.utils.shell(arg, 'done publishing mss pattern', 'failed to publish mms pattern');
    }
    unregisterAgent() {
        let arg = `hzn unregister -f`;
        return exports.utils.shell(arg, 'done unregistering agent', 'failed to unregister agent');
    }
    registerAgent() {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = `hzn register --policy ${this.nodePolicyJson} --pattern "${this.pattern}"`;
                    exports.utils.shell(arg, 'done registering agent', 'failed to register agent')
                        .subscribe({
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    publishMMSObject() {
        let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.pattern}`;
        return exports.utils.shell(arg, 'done publishing object', 'failed to publish object');
    }
    buildAndPublish() {
        return new rxjs_1.Observable((observer) => {
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
                                            });
                                        }, error: (err) => {
                                            observer.error(err);
                                        }
                                    });
                                }, error: (err) => {
                                    observer.error(err);
                                }
                            });
                        }, error: (err) => {
                            observer.error(err);
                        }
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    publishServiceAndPattern() {
        return new rxjs_1.Observable((observer) => {
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
                                    });
                                }, error: (err) => {
                                    observer.error(err);
                                }
                            });
                        }, error: (err) => {
                            observer.error(err);
                        }
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    buildPublishAndRegister() {
        return new rxjs_1.Observable((observer) => {
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
                                    });
                                }, error: (err) => {
                                    observer.error(err);
                                }
                            });
                        }, error: (err) => {
                            observer.error(err);
                        }
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    publishAndRegister() {
        return new rxjs_1.Observable((observer) => {
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
                            });
                        }, error: (err) => {
                            observer.error(err);
                        }
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    editPolicy() {
        return exports.utils.editPolicy();
    }
    editDeploymentPolicy() {
    }
    editNodePolicy() {
        return exports.utils.editNodePolicy();
    }
    editServicePolicy() {
        return exports.utils.editServicePolicy();
    }
    addDeploymentPolicy() {
        let arg = `hzn exchange deployment addpolicy -f ${this.deploymentPolicyJson} ${this.envVar.getEnvValue('HZN_ORG_ID')}/policy-${this.envVar.getEnvValue('SERVICE_NAME')}_${this.envVar.getEnvValue('SERVICE_VERSION')}`;
        return exports.utils.shell(arg);
    }
    addServicePolicy() {
        let arg = `hzn exchange service addpolicy -f ${this.servicePolicyJson} ${this.envVar.getEnvValue('HZN_ORG_ID')}/${this.envVar.getEnvValue('SERVICE_NAME')}_${this.envVar.getEnvValue('SERVICE_VERSION')}_${this.envVar.getEnvValue('ARCH')}`;
        return exports.utils.shell(arg);
    }
    addNodePolicy() {
        let arg = `hzn register --policy ${this.nodePolicyJson}`;
        return exports.utils.shell(arg);
    }
    showHznInfo() {
        return exports.utils.showHznInfo();
    }
    updateHznInfo() {
        return exports.utils.updateHznInfo();
    }
    listService() {
        return exports.utils.listService(this.name);
    }
    listPattern() {
        return exports.utils.listPattern(this.name);
    }
    listNode() {
        return exports.utils.listNode(this.name);
    }
    listObject() {
        return exports.utils.listObject(this.name);
    }
    listDeploymentPolicy() {
        return exports.utils.listDeploymentPolicy(this.name);
    }
    checkConfigState() {
        return exports.utils.checkConfigState();
    }
    listNodePattern() {
        return exports.utils.listNodePattern();
    }
    getDeviceArch() {
        return exports.utils.getDeviceArch();
    }
    createHznKey() {
        return exports.utils.createHznKey(this.envVar.getOrgId(), this.envVar.getMyDockerHubId());
    }
    aptUpdate() {
        return exports.utils.aptUpdate();
    }
    installPrereq() {
        return exports.utils.installPrereq();
    }
    installHznCli() {
        return exports.utils.installHznCli(this.envVar.getAnax(), this.envVar.getHznNodeID());
    }
    uninstallHorizon() {
        return exports.utils.uninstallHorizon();
    }
    preInstallHznCli() {
        return new rxjs_1.Observable((observer) => {
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
                            });
                        },
                        error: (err) => {
                            observer.error(err);
                        }
                    });
                },
                error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    setupManagementHub() {
        return exports.utils.setupManagementHub();
    }
    setupRedHat() {
        return new rxjs_1.Observable((observer) => {
            exports.utils.checkOS()
                .subscribe({
                next: (stdout) => {
                    if (stdout.toLowerCase().indexOf('redhat') >= 0) {
                        exports.utils.shell(`sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine podman runc 
                        && sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo -y 
                        && sudo yum install docker-ce docker-ce-cli containerd.io`)
                            .subscribe({
                            complete: () => observer.complete(),
                            error: (err) => observer.error(err)
                        });
                    }
                    else {
                        console.log('This is not RHEL');
                        observer.complete();
                    }
                }
            });
        });
    }
    getIpAddress() {
        return new rxjs_1.Observable((observer) => {
            let result = exports.utils.getIpAddress();
            console.log(result);
            observer.complete();
        });
    }
}
exports.Hzn = Hzn;
//# sourceMappingURL=hzn.js.map