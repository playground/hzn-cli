"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hzn = exports.utils = void 0;
const rxjs_1 = require("rxjs");
const cp = require('child_process'), exec = cp.exec;
const env_1 = require("./env");
const utils_1 = require("./utils");
const prompt = require('prompt');
exports.utils = new utils_1.Utils();
class Hzn {
    constructor(env, configPath, name, objectType, objectId, objectFile, mmsPattern) {
        this.envVar = new env_1.Env(env, configPath);
        this.configPath = configPath;
        this.name = name;
        this.objectType = objectType;
        this.objectId = objectId;
        this.objectFile = objectFile;
        this.mmsPattern = mmsPattern;
    }
    init() {
        return new rxjs_1.Observable((observer) => {
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
    buildServiceImage() {
        return new rxjs_1.Observable((observer) => {
            let arg = `docker build -t ${this.envVar.getServiceContainer()} -f Dockerfile-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done building service docker image`);
                }
                else {
                    console.log('failed to build service docker image', err);
                }
                observer.next();
                observer.complete();
            });
        });
    }
    pushServiceImage() {
        return new rxjs_1.Observable((observer) => {
            let arg = `docker push ${this.envVar.getServiceContainer()}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done pushing service docker image`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to push service docker image', err);
                    observer.error(err);
                }
            });
        });
    }
    buildMMSImage() {
        let arg = `docker build -t ${this.envVar.getMMSContainer()} -f Dockerfile-${this.envVar.getArch()} .`.replace(/\r?\n|\r/g, '');
        return exports.utils.shell(arg, 'done building mms docker image', 'failed to build mms docker image');
    }
    pushMMSImage() {
        return new rxjs_1.Observable((observer) => {
            let arg = `docker push ${this.envVar.getMMSContainer()}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done pushing mms docker image`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to push mms docker image', err);
                    observer.error(err);
                }
            });
        });
    }
    publishMMSService() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn exchange service publish -O ${this.envVar.getMMSContainerCreds()} -f ${this.mmsServiceJson}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done publishing mms service`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to publish mms service', err);
                    observer.error(err);
                }
            });
        });
    }
    publishMMSPattern() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn exchange pattern publish -f ${this.mmsPatternJson}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done publishing mss pattern`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to publish mms pattern', err);
                    observer.error(err);
                }
            });
        });
    }
    unregisterAgent() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn unregister -f`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done unregistering agent`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to unregister agent', err);
                    observer.error(err);
                }
            });
        });
    }
    registerAgent() {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = `hzn register --policy ${this.mmsPolicyJson} --pattern "${this.mmsPattern}"`;
                    console.log(arg);
                    exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                        if (!err) {
                            console.log(stdout);
                            console.log(`done registering mss agent`);
                            observer.next();
                            observer.complete();
                        }
                        else {
                            console.log('failed to register mms agent', err);
                            observer.error(err);
                        }
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    publishMMSObject() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn mms object publish --type=${this.objectType} --id=${this.objectId} --object=${this.objectFile} --pattern=${this.mmsPattern}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done publishing object`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to publish object', err);
                    observer.error(err);
                }
            });
        });
    }
    allInOneMMS() {
        return new rxjs_1.Observable((observer) => {
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
    publishService() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn exchange service publish -O ${this.envVar.getServiceContainerCreds()} -f ${this.serviceJson} --pull-image`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done publishing ${this.envVar.getServiceName()} service`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to publish service', err);
                    observer.error(err);
                }
            });
        });
    }
    publishPattern() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn exchange pattern publish -f ${this.patternJson}`;
            console.log(arg);
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    console.log(`done publishing ${this.envVar.getPatternName()} pattern`);
                    observer.next();
                    observer.complete();
                }
                else {
                    console.log('failed to publish mms pattern', err);
                    observer.error(err);
                }
            });
        });
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
}
exports.Hzn = Hzn;
//# sourceMappingURL=hzn.js.map