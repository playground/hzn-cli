"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const rxjs_1 = require("rxjs");
const fs_1 = require("fs");
const cp = require('child_process'), exec = cp.exec;
const dotenv = require('dotenv');
const pEnv = process.env;
class Env {
    constructor(env, hznConfig) {
        this.env = env;
        this.hznConfig = hznConfig;
        this.hznEnv = `${hznConfig}/.env-hzn.json`;
    }
    init() {
        return new rxjs_1.Observable((observer) => {
            const localEnv = dotenv.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-local`));
            for (let i in localEnv) {
                pEnv[i] = localEnv[i];
                console.log(pEnv[i]);
            }
            const supportEnv = dotenv.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-support`));
            for (let i in supportEnv) {
                pEnv[i] = supportEnv[i];
            }
            const hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
            const credential = hznJson[this.env].credential;
            if (credential) {
                Object.keys(credential).forEach((key) => {
                    pEnv[key] = credential[key];
                });
            }
            pEnv.HZN_ORG_ID = this.env;
            this.hznJson = JSON.parse((0, fs_1.readFileSync)(this.hznEnv).toString());
            // console.log(process.cwd(), this.env, this.hznJson)
            this.envVars = this.hznJson[this.env]['envVars'];
            for (const [key, value] of Object.entries(this.envVars)) {
                if (!pEnv[key]) {
                    // @ts-ignore
                    pEnv[key] = value.replace(/\r?\n|\r/g, '');
                }
                // console.log(`${key}: ${pEnv[key]}`);
            }
            if (!this.envVars.ARCH || this.envVars.ARCH === undefined) {
                let arg = `hzn architecture`;
                exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                    if (!err) {
                        pEnv.ARCH = this.envVars.ARCH = stdout.replace(/\r?\n|\r/g, '');
                        this.setAdditionalEnv();
                        observer.next();
                        observer.complete();
                    }
                    else {
                        console.log('failed to identify arch');
                        observer.error(err);
                    }
                });
            }
            else {
                console.log(this.envVars.ARCH, 'here');
                this.setAdditionalEnv();
                console.log(this.envVars.ARCH);
                observer.next();
                observer.complete();
            }
        });
    }
    setAdditionalEnv() {
        let container = pEnv.MMS_CONTAINER_NAME || pEnv.MMS_SERVICE_NAME;
        pEnv.MMS_PATTERN_NAME = `pattern-${pEnv.MMS_SERVICE_NAME}-${pEnv.ARCH}`;
        pEnv.MMS_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.MMS_SERVICE_VERSION}`.replace(/\r?\n|\r/g, '');
        pEnv.PATTERN_NAME = `pattern-${pEnv.SERVICE_NAME}`;
        container = pEnv.SERVICE_CONTAINER_NAME || pEnv.SERVICE_NAME;
        pEnv.SERVICE_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.SERVICE_VERSION}`.replace(/\r?\n|\r/g, '');
    }
    updateContainerAndServiceNames() {
        console.log('update', this.getEdgeDeploy(), this.getEdgeOwner());
        if (this.getServiceContainerName() != this.getServiceName()) {
            this.setServiceContainer(`${this.getServiceContainerName()}:${this.getServiceVersion()}`);
        }
        // if(this.getEdgeDeploy() && this.getEdgeOwner()) {
        //   this.setServiceName(`${this.getEdgeOwner()}.${this.getEdgeDeploy()}.${this.getServiceName()}`)
        // }
        if (this.getMMSContainerName() != this.getMMSServiceName()) {
            this.setMMSContainer(`${this.getMMSContainerName()}:${this.getMMSServiceVersion()}`);
        }
        // if(this.getEdgeDeploy() && this.getEdgeOwner()) {
        //   this.setMMSServiceName(`${this.getEdgeOwner()}.${this.getEdgeDeploy()}.${this.getMMSServiceName()}`)
        // }  
    }
    getEnvValue(key) {
        return pEnv[key];
    }
    getEnv() {
        return this.env;
    }
    getOrgId() {
        console.log(pEnv.HZN_ORG_ID);
        return pEnv.HZN_ORG_ID;
    }
    setOrgId(orgId = pEnv.DEFAULT_ORG) {
        pEnv.HZN_ORG_ID = orgId;
    }
    getExchangeUserAuth() {
        return pEnv.HZN_EXCHANGE_USER_AUTH;
    }
    getExchangeUrl() {
        return pEnv.HZN_EXCHANGE_URL;
    }
    getFSSCSSUrl() {
        return pEnv.HZN_FSS_CSSURL;
    }
    getServiceName() {
        return pEnv.SERVICE_NAME;
    }
    setServiceName(name) {
        pEnv.SERVICE_NAME = name;
    }
    getServiceVersion() {
        return pEnv.SERVICE_VERSION;
    }
    getMMSSharedVolume() {
        return pEnv.MMS_SHARED_VOLUME;
    }
    getMyDockerHubId() {
        return pEnv.YOUR_DOCKERHUB_ID;
    }
    getDockerImageBase() {
        return `${pEnv.YOUR_DOCKERHUB_ID}/${pEnv.MMS_SERVICE_NAME}`;
    }
    getMMSContainerCreds() {
        return pEnv.MMS_CONTAINER_CREDS;
    }
    getMMSPatterName() {
        return pEnv.MMS_PATTERN_NAME;
    }
    getMMSServiceName() {
        return pEnv.MMS_SERVICE_NAME;
    }
    setMMSServiceName(name) {
        pEnv.MMS_SERVICE_NAME = name;
    }
    getMMSServiceVersion() {
        return pEnv.MMS_SERVICE_VERSION;
    }
    getMMSContainerName() {
        return pEnv.MMS_CONTAINER_NAME;
    }
    getMMSContainer() {
        return pEnv.MMS_CONTAINER;
    }
    setMMSContainer(container) {
        pEnv.MMS_CONTAINER = container;
    }
    getArch() {
        return pEnv.ARCH;
    }
    getMMSObjectType() {
        return pEnv.MMS_OBJECT_TYPE;
    }
    getMMSObjectId() {
        return pEnv.MMS_OBJECT_ID;
    }
    getMMSObjectFile() {
        return pEnv.MMS_OBJECT_FILE;
    }
    getServiceContainerCreds() {
        return pEnv.SERVICE_CONTAINER_CREDS;
    }
    getServiceContainerName() {
        return pEnv.SERVICE_CONTAINER_NAME;
    }
    getPatternName() {
        return pEnv.PATTERN_NAME;
    }
    getServiceContainer() {
        return pEnv.SERVICE_CONTAINER;
    }
    setServiceContainer(container) {
        pEnv.SERVICE_CONTAINER = container;
    }
    getAnax() {
        return pEnv.ANAX || null;
    }
    getInputFilePath() {
        return pEnv.INPUT_FILE_PATH || null;
    }
    getHznNodeID() {
        return pEnv.HZN_CUSTOM_NODE_ID || null;
    }
    getHznCSS() {
        return pEnv.HZN_CSS || false;
    }
    getServiceFlags() {
        return pEnv.SERVICE_FLAGS || '--pull-image';
    }
    getHznDeviceToken() {
        return pEnv.HZN_DEVICE_TOKEN || 'some-device-token';
    }
    getDockerRegistry() {
        return pEnv.DOCKER_REGISTRY || null;
    }
    getDockerToken() {
        return pEnv.DOCKER_TOKEN || null;
    }
    getEdgeOwner() {
        return pEnv.EDGE_OWNER || null;
    }
    getEdgeDeploy() {
        return pEnv.EDGE_DEPLOY || null;
    }
}
exports.Env = Env;
//# sourceMappingURL=env.js.map