"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const rxjs_1 = require("rxjs");
const cp = require('child_process'), exec = cp.exec;
const env = process.env.npm_config_env || 'biz';
class Utils {
    constructor() { }
    init() {
    }
    listService() {
        let name = process.env.npm_config_name;
        name = name ? `hzn exchange service list ${name}` : 'hzn exchange service list';
        return this.shell(name);
    }
    listPattern() {
        let name = process.env.npm_config_name;
        name = name ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
        return this.shell(name);
    }
    listNode() {
        let name = process.env.npm_config_name;
        name = name ? `hzn exchange node list ${name}` : 'hzn exchange node list';
        return this.shell(name);
    }
    listObject() {
        let name = process.env.npm_config_name;
        name = name ? `hzn mms object list ${name}` : 'hzn mms object list';
        return this.shell(name);
    }
    listDeploymentPolicy() {
        let name = process.env.npm_config_name;
        name = name ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
        return this.shell(name);
    }
    createHznKey() {
        let org = process.env.npm_config_org;
        let email = process.env.npm_config_email;
        if (org && email) {
            return this.shell(`hzn key creat ${org} ${email}`);
        }
        else {
            console.log('please provide both org and email: --org=<org> --email=<email>.');
            return (0, rxjs_1.of)();
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
    installHznCli() {
        return this.shell(`curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/api/v1/objects/IBM/agent_files/agent-install.sh/data && chmod +x agent-install.sh && sudo -s -E ./agent-install.sh -i 'css:'`);
    }
    shell(arg) {
        return new rxjs_1.Observable((observer) => {
            exec(arg, { maxBuffer: 1024 * 2000 }, (err, stdout, stderr) => {
                if (!err) {
                    console.log(stdout);
                    observer.next(stdout);
                    observer.complete();
                }
                else {
                    console.log(`shell command failed: ${err}`);
                    observer.error(err);
                }
            });
        });
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map