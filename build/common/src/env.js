"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const rxjs_1 = require("rxjs");
const fs_1 = require("fs");
const cp = require('child_process'), exec = cp.exec;
var dotenv = require('dotenv');
const pEnv = process.env;
class Env {
    constructor(env, configPath) {
        if ((0, fs_1.existsSync)(`/etc/default/.env-local`)) {
            const localEnv = dotenv.parse((0, fs_1.readFileSync)(`/etc/default/.env-local`));
            for (var i in localEnv) {
                pEnv[i] = localEnv[i];
            }
        }
        this.env = env;
        this.configPath = configPath;
        this.hznEnv = `${configPath}/.env-hzn.json`;
    }
    init() {
        return new rxjs_1.Observable((observer) => {
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
                this.setAdditionalEnv();
                console.log(this.envVars.ARCH);
                observer.next();
                observer.complete();
            }
        });
    }
    setAdditionalEnv() {
        let container = pEnv.MMS_CONTAINER_NAME || pEnv.MMS_SERVICE_NAME;
        pEnv.HZN_ORG_ID = this.env;
        pEnv.MMS_PATTERN_NAME = `pattern-${pEnv.MMS_SERVICE_NAME}-${pEnv.ARCH}`;
        pEnv.MMS_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.MMS_SERVICE_VERSION}`.replace(/\r?\n|\r/g, '');
        pEnv.PATTERN_NAME = `pattern-${pEnv.SERVICE_NAME}`;
        container = pEnv.SERVICE_CONTAINER_NAME || pEnv.SERVICE_NAME;
        pEnv.SERVICE_CONTAINER = `${pEnv.YOUR_DOCKERHUB_ID}/${container}_${pEnv.ARCH}:${pEnv.SERVICE_VERSION}`.replace(/\r?\n|\r/g, '');
    }
    getEnv() {
        return this.env;
    }
    getOrgId() {
        console.log(pEnv.HZN_ORG_ID);
        return pEnv.HZN_ORG_ID;
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
    getMMSServiceVersion() {
        return pEnv.MMS_SERVICE_VERSION;
    }
    getMMSContainer() {
        return pEnv.MMS_CONTAINER;
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
    getPatternName() {
        return pEnv.PATTERN_NAME;
    }
    getServiceContainer() {
        return pEnv.SERVICE_CONTAINER;
    }
    getAnax() {
        return pEnv.ANAX || null;
    }
    getHznNodeID() {
        return pEnv.HZN_CUSTOM_NODE_ID || null;
    }
}
exports.Env = Env;
//# sourceMappingURL=env.js.map