"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hzn = exports.utils = void 0;
const fs_1 = require("fs");
const rxjs_1 = require("rxjs");
const env_1 = require("./env");
const interface_1 = require("./interface");
const utils_1 = require("./utils");
exports.utils = new utils_1.Utils();
class Hzn {
    constructor(param) {
        this.nodePolicyJson = '';
        this.deploymentPolicyJson = '';
        this.topLevelDeploymentPolicyJson = '';
        this.servicePolicyJson = '';
        this.objectPolicyJson = '';
        this.objectPatternJson = '';
        this.serviceDefinitionJson = '';
        this.servicePatternJson = '';
        this.utils = exports.utils;
        this.param = param;
        this.org = param.org;
        this.envVar = new env_1.Env(param.org, exports.utils.getHznConfig());
        this.configPath = param.configPath;
        this.name = param.name;
        this.objectType = param.objectType;
        this.objectId = param.objectId;
        this.objectFile = param.objectFile;
        this.mmsPattern = param.mmsPattern;
    }
    init(cliBypass = false, cliOptional = false) {
        return new rxjs_1.Observable((observer) => {
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
                    this.topLevelDeploymentPolicyJson = `${this.configPath}/top.level.deployment.policy.json`,
                        this.servicePolicyJson = `${this.configPath}/service.policy.json`;
                    this.objectPolicyJson = `${this.configPath}/object.policy.json`;
                    this.objectPatternJson = `${this.configPath}/object.pattern.json`;
                    this.param.policy = this.getPolicyInfo();
                    this.envVar.updateContainerAndServiceNames();
                    if (interface_1.promptForUpdate.indexOf(this.param.action) >= 0) {
                        exports.utils.switchEnvironment(this.org)
                            .subscribe(() => {
                            observer.complete();
                        });
                    }
                    else {
                        observer.complete();
                    }
                },
                error: (err) => {
                    console.log(err.message);
                    this.envVar.setOrgId();
                    if (err.message.indexOf('hzn:') >= 0) {
                        console.log('here:', cliBypass, cliOptional);
                        if (cliBypass) {
                            this.updateConfigFile()
                                .subscribe(() => {
                                observer.next('');
                                observer.complete();
                            });
                        }
                        else {
                            if (!cliOptional) {
                                console.log('need to install hzn');
                            }
                            const answer = exports.utils.promptCliOrAnax();
                            if (answer == 'Y') {
                                exports.utils.installCliOnly(this.envVar.getAnax())
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
                                if (cliOptional == true) {
                                    observer.complete();
                                }
                                else {
                                    console.log('preInstallHznCli from hzn.ts');
                                    this.preInstallHznCli()
                                        .subscribe({
                                        complete: () => {
                                            console.log('done installing hzn.');
                                            observer.complete();
                                        },
                                        error: (err) => {
                                            observer.error(err);
                                        }
                                    });
                                }
                            }
                        }
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
            console.log(`it works..., your environment is ready to go!`);
            observer.complete();
        });
    }
    setup() {
        return new rxjs_1.Observable((observer) => {
            console.log(`it works..., your environment is ready to go!`);
            observer.complete();
        });
    }
    updateConfigFile() {
        return this.param.configFile.length > 0 ?
            exports.utils.updateConfig(this.param.configFile) :
            (0, rxjs_1.of)('Please specify config file name');
    }
    appendSupport() {
        return exports.utils.appendSupport();
    }
    installAnaxInContainer() {
        return exports.utils.installAnaxOrCli(true);
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
        let dockerFile = `Dockerfile-mms-${this.envVar.getArch()}`.replace(/\r?\n|\r/g, '');
        let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
        if (!(0, fs_1.existsSync)(`./${dockerFile}`)) {
            arg = `docker build -t ${this.envVar.getMMSContainer()} -f ${__dirname}/hzn-config/setup/${dockerFile} ${__dirname}/hzn-config/setup`.replace(/\r?\n|\r/g, '');
        }
        // let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-mms-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
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
        let arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceJson} --pull-image`;
        if (this.envVar.getDockerRegistry() && this.envVar.getDockerToken()) {
            arg += ` -r "${this.envVar.getDockerRegistry()}:${this.envVar.getMyDockerHubId()}:${this.envVar.getDockerToken()}"`;
        }
        // const arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceJson} ${this.envVar.getServiceFlags()}`;
        return exports.utils.shell(arg, 'done publishing service', 'failed to publish service');
    }
    publishPattern() {
        const arg = `hzn exchange pattern publish -f ${this.patternJson}`;
        return exports.utils.shell(arg, 'done publishing service pattern', 'failed to publish service pattern');
    }
    publishMMSService() {
        let arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson} --pull-image`;
        if (this.envVar.getDockerRegistry() && this.envVar.getDockerToken()) {
            arg += ` -r "${this.envVar.getDockerRegistry()}:${this.envVar.getMyDockerHubId()}:${this.envVar.getDockerToken()}"`;
        }
        // const arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson} ${this.envVar.getServiceFlags()}`;
        return exports.utils.shell(arg, 'done publishing mms service', 'failed to publish mms service');
    }
    publishMMSPattern() {
        const arg = `hzn exchange pattern publish -f ${this.mmsPatternJson}`;
        return exports.utils.shell(arg, 'done publishing mss pattern', 'failed to publish mms pattern', false);
    }
    createDeployment() {
        return this.param.image.length > 0 && this.param.name.length > 0 ?
            exports.utils.shell(`kubectl create deployment ${this.param.name} --image ${this.param.image} -n $AGENT_NAMESPACE`) :
            (0, rxjs_1.of)('Please specify deploment --name and --image');
    }
    createNetworkSegment() {
        return this.param.name.length > 0 ?
            exports.utils.shell(`cat << EOM | palmctl create networksegment -f - 
        name: ${this.param.name} 
        compatibility_set: ${this.param.compatibility}`) :
            (0, rxjs_1.of)('Please specify agent name');
    }
    exposeDeployment() {
        const type = this.param.type.length > 0 ? ` --type ${this.param.type}` : '';
        return this.param.name.length > 0 && this.param.port.length > 0 ?
            exports.utils.shell(`kubectl expose deployment/${this.param.name} --port ${this.param.port}${type} -n $AGENT_NAMESPACE`) :
            (0, rxjs_1.of)('Please specify deploment --name, --port and --type');
    }
    uninstallAgent() {
        return this.param.name.length > 0 ?
            exports.utils.shell(`sudo chmod +x ${this.param.name} && ${this.param.name}`) :
            (0, rxjs_1.of)('Please specify agent uninstall script --name');
    }
    setDefaultNamespace() {
        let arg = `microk8s kubectl config set-context --current --namespace=ohmesh-backend-k8s-ns`;
    }
    meshNodeList() {
        return this.param.name.length > 0 ?
            exports.utils.shell(`kubectl -n $AGENT_NAMESPACE exec -i ${this.param.name} -- hzn node list`, 'commande executed successfully', 'failed to execute command', false) :
            (0, rxjs_1.of)('Please specify agent name');
    }
    meshAgreementList() {
        return this.param.name.length > 0 ?
            exports.utils.shell(`kubectl -n $AGENT_NAMESPACE exec -i ${this.param.name} -- hzn agreement list`, 'commande executed successfully', 'failed to execute command', false) :
            (0, rxjs_1.of)('Please specify agent name');
    }
    meshAgentEventLog() {
        return this.param.name.length > 0 ?
            exports.utils.shell(`kubectl -n $AGENT_NAMESPACE exec -i ${this.param.name} -- hzn eventlog list`, 'commande executed successfully', 'failed to execute command', false) :
            (0, rxjs_1.of)('Please specify agent name');
    }
    deleteAgentNamespace() {
        return exports.utils.shell(`kubectl delete namespace ${process.env.AGENT_NAMESPACE}`, 'commande executed successfully', 'failed to execute command', false);
    }
    meshPodList() {
        return exports.utils.shell(`kubectl get pods -A`, 'commande executed successfully', 'failed to execute command', false);
    }
    meshServiceList() {
        return exports.utils.shell(`kubectl get services -A`, 'commande executed successfully', 'failed to execute command', false);
    }
    registerMeshAgent() {
        return exports.utils.registerMeshAgent();
    }
    unregisterMeshAgentByName() {
        return this.param.name.length > 0 ? exports.utils.unregisterMeshAgentByName(this.param) : (0, rxjs_1.of)('Please specify agent name');
    }
    unregisterMeshAgent() {
        return exports.utils.unregisterMeshAgent(this.param);
    }
    unregisterAgent() {
        return exports.utils.unregisterAgent(true);
    }
    register() {
        return exports.utils.register(this);
    }
    registerAgent() {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = `hzn register --policy ${this.nodePolicyJson} --pattern "${this.mmsPattern}"`;
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
        let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.mmsPattern}`;
        return exports.utils.shell(arg, 'done publishing object', 'failed to publish object');
    }
    publishMMSObjectPattern() {
        if (!this.mmsPattern || this.mmsPattern.length == 0) {
            return (0, rxjs_1.of)('Please specify --pattern name');
        }
        else {
            process.env.HZN_PATTERN = this.mmsPattern;
            let arg = `hzn mms object publish -m ${this.objectPatternJson} -f ${this.objectFile}`;
            return exports.utils.shell(arg, 'done publishing object', 'failed to publish object');
        }
    }
    publishMMSObjectPolicy() {
        let arg = `hzn mms object publish -m ${this.objectPolicyJson} -f ${this.objectFile}`;
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
    publishAndRegister() {
        return new rxjs_1.Observable((observer) => {
            this.publishServiceAndPattern().subscribe({
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
        });
    }
    getPolicyInfo() {
        let policyInfo = {
            envVar: this.envVar,
            nodePolicyJson: this.nodePolicyJson,
            servicePolicyJson: this.servicePolicyJson,
            objectPolicyJson: this.objectPolicyJson,
            deploymentPolicyJson: this.deploymentPolicyJson,
            topLevelDeploymentPolicyJson: this.topLevelDeploymentPolicyJson
        };
        return policyInfo;
    }
    reviewServiceDefinition() {
        return exports.utils.reviewServiceDefinition();
    }
    reviewPolicy() {
        return exports.utils.reviewPolicy();
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
    addPolicy() {
        return exports.utils.addPolicy(this.param, this.getPolicyInfo());
    }
    updatePolicy() {
        return exports.utils.updatePolicy(this.param, this.getPolicyInfo());
    }
    addDeploymentPolicy() {
        return exports.utils.addDeploymentPolicy(this.getPolicyInfo());
    }
    addServicePolicy() {
        return exports.utils.addServicePolicy(this.getPolicyInfo());
    }
    addNodePolicy() {
        return exports.utils.addNodePolicy(this.param, this.getPolicyInfo());
    }
    addRemoteNodePolicy() {
        return this.param.name.length > 0 ? exports.utils.addRemoteNodePolicy(this.param, this.getPolicyInfo()) : (0, rxjs_1.of)('Please specify remote node name');
    }
    showHznInfo() {
        return exports.utils.showHznInfo();
    }
    updateHznInfo() {
        return exports.utils.updateHznInfo();
    }
    listAgreement() {
        return exports.utils.listAgreement(this.param);
    }
    listService() {
        return exports.utils.listService(this.param);
    }
    listAllServices() {
        return exports.utils.listAllServices(this.param);
    }
    removeService() {
        return this.param.name.length > 0 ? exports.utils.removeService(`${this.param.org}/${this.param.name}`) : (0, rxjs_1.of)('Please specify service name');
    }
    isConfigured() {
        return exports.utils.isNodeConfigured();
    }
    listPattern() {
        return exports.utils.listPattern(this.name);
    }
    listNode() {
        return exports.utils.listNode(this.param);
    }
    listNodes() {
        return exports.utils.listNodes(this.param);
    }
    listOrg() {
        return exports.utils.listOrg(this.param);
    }
    listExchangeNode() {
        return exports.utils.listExchangeNode(this.param);
    }
    removeNode() {
        return this.param.name.length > 0 ? exports.utils.removeNode(`${this.param.org}/${this.param.name}`) : (0, rxjs_1.of)('Please specify node name');
    }
    listObject() {
        return exports.utils.listObject(this.param);
    }
    removeObject() {
        return exports.utils.removeObject(this.param);
    }
    listPolicy() {
        return exports.utils.listPolicy();
    }
    listExchangeNodePolicy() {
        return this.param.name.length > 0 ? exports.utils.listExchangeNodePolicy(this.param) : (0, rxjs_1.of)('Please specify node name');
    }
    listServicePolicy() {
        return this.param.name.length > 0 ? exports.utils.listServicePolicy(`${this.param.org}/${this.param.name}`) : (0, rxjs_1.of)('Please specify service policy name');
    }
    listDeploymentPolicy() {
        return exports.utils.listDeploymentPolicy(this.param.name);
    }
    removeDeploymentPolicy() {
        return this.param.name.length > 0 ? exports.utils.removeDeploymentPolicy(`${this.param.org}/${this.param.name}`) : (0, rxjs_1.of)('Please specify deployment policy name');
    }
    deleteObject() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn mms object delete -t ${this.objectType} -i ${this.objectId} -d`;
            exports.utils.shell(arg, 'done deleting object', 'failed to delete object')
                .subscribe(() => {
                // delete twice deletes right away
                exports.utils.shell(arg, 'done deleting object', 'failed to delete object')
                    .subscribe(() => observer.complete());
            });
        });
    }
    deployCheck() {
        return this.param.name.length > 0 ? exports.utils.deployCheck(this.param.name, `${this.param.org}/${this.envVar.getHznNodeID()}`) : (0, rxjs_1.of)('Please specify deployment policy name, ex: --name policy-chunk-saved-model-service_arm64');
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
        return exports.utils.installHznCli(this.envVar.getAnax(), this.envVar.getHznNodeID(), this.envVar.getHznCSS());
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