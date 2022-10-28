"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.promptSync = void 0;
const fs_1 = require("fs");
const jsonfile_1 = __importDefault(require("jsonfile"));
const os_1 = __importDefault(require("os"));
const prompt_1 = __importDefault(require("prompt"));
const rxjs_1 = require("rxjs");
const url_1 = require("url");
const _1 = require(".");
const interface_1 = require("./interface");
const cp = require('child_process'), exec = cp.exec;
const ifs = os_1.default.networkInterfaces();
exports.promptSync = require('prompt-sync')();
const env = process.env.npm_config_env || 'biz';
const isBoolean = [
    'TOP_LEVEL_SERVICE'
];
const notRequired = [
    'SERVICE_CONTAINER_CREDS', 'MMS_CONTAINER_CREDS', 'OBJECT_FILE', 'OBJECT_ID', 'OBJECT_TYPE', 'HZN_CUSTOM_NODE_ID', 'UPDATE_FILE_NAME',
    'SUPPORTED_OS_APPEND', 'SUPPORTED_LINUX_DISTRO_APPEND', 'SUPPORTED_DEBIAN_VARIANTS_APPEND', 'SUPPORTED_DEBIAN_VERSION_APPEND',
    'SUPPORTED_DEBIAN_ARCH_APPEND', 'SUPPORTED_REDHAT_VARIANTS_APPEND', 'SUPPORTED_REDHAT_VERSION_APPEND', 'SUPPORTED_REDHAT_ARCH_APPEND',
    'DOCKER_REGISTRY', 'DOCKER_TOKEN'
];
const mustHave = [
    "SERVICE_NAME",
    "SERVICE_CONTAINER_NAME",
    "SERVICE_VERSION",
    "SERVICE_VERSION_RANGE_UPPER",
    "SERVICE_VERSION_RANGE_LOWER",
    "SERVICE_CONTAINER_CREDS",
    "VOLUME_MOUNT",
    "MMS_SHARED_VOLUME",
    "MMS_OBJECT_TYPE",
    "MMS_OBJECT_ID",
    "MMS_OBJECT_FILE",
    "MMS_CONTAINER_CREDS",
    "MMS_CONTAINER_NAME",
    "MMS_SERVICE_NAME",
    "MMS_SERVICE_VERSION",
    "MMS_SERVICE_FALLBACK_VERSION",
    "UPDATE_FILE_NAME"
];
// ToDo: use configTemplate instead
const credentialVars = [
    "HZN_EXCHANGE_USER_AUTH",
    "HZN_EXCHANGE_URL",
    "HZN_FSS_CSSURL",
    "ANAX"
];
class Utils {
    constructor() {
        this.etcDefault = '/etc/default';
        this.etcHorizon = '/etc/horizon';
        this.homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        this.hznConfig = `${this.homePath}/hzn-config`;
        this.configJson = {};
    }
    init() {
    }
    invalidTemplate(json) {
        let matched = true;
        const envHzn = interface_1.configTemplate.envHzn;
        Object.keys(json).some((key) => {
            Object.keys(envHzn[interface_1.keyMap[key]]).some((skey) => {
                matched = json[key][skey] != undefined ? true : false;
                if (mustHave[skey] && !matched) {
                    console.log(`Invalid:  Missing ${skey}`);
                }
                return !matched;
            });
            return !matched;
        });
        return matched;
    }
    randomString() {
        return Math.random().toString(36).slice(2);
    }
    preInstallHznCli(orgId, anax, nodeId, css, token) {
        return new rxjs_1.Observable((observer) => {
            this.installPrereq()
                .subscribe({
                complete: () => {
                    console.log('am i here', anax, nodeId, css, typeof css, token);
                    this.installHznCli(anax, nodeId, css, token)
                        .subscribe({
                        complete: () => {
                            this.createHznKey(orgId, this.randomString())
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
                    console.log('am i here');
                    observer.error(err);
                }
            });
        });
    }
    installCliInContainer(configJson) {
        return new rxjs_1.Observable((observer) => {
            if (configJson.cliInContainer) {
                this.shell(configJson.cliInContainer)
                    .subscribe({
                    complete: () => {
                        observer.next();
                        observer.complete();
                    },
                    error: (err) => {
                        observer.error(err);
                    }
                });
            }
            else {
                console.log('Missing cliInContainer property in configuration file');
                observer.error();
            }
        });
    }
    createHorizonSystemFiles(configJson) {
        return new rxjs_1.Observable((observer) => {
            let content = '';
            const pEnv = process.env;
            Object.keys(interface_1.HorizonTemplate).forEach((key) => {
                console.log(key);
                if (content.length > 0)
                    content += '\n';
                if (pEnv[key]) {
                    content += `${key}=${pEnv[key]}`;
                }
                else {
                    if (interface_1.HorizonKeyMap[key]) {
                        pEnv[key] = interface_1.HorizonTemplate[key];
                        content += `${key}=${pEnv[key]}`;
                    }
                    if (key == 'HZN_NODE_ID') {
                        content += `${key}=${pEnv.HZN_DEVICE_ID}`;
                    }
                }
            });
            console.log(content);
            if (content.length > 0) {
                (0, fs_1.writeFileSync)(`${process.cwd()}/horizon`, content);
                this.copyFile(`sudo mv ${process.cwd()}/horizon /var`).then(() => {
                    const folders = configJson.folders;
                    if ((0, fs_1.existsSync)(pEnv.CONFIG_CERT_PATH) && folders) {
                        this.copyFile(`sudo cp ${pEnv.CONFIG_CERT_PATH} /var`).then(() => {
                            let arg = '';
                            folders.forEach((folder) => {
                                if (arg.length > 0) {
                                    arg += ' && ';
                                }
                                arg += `sudo mkdir -p ${folder}`;
                            });
                            this.shell(arg)
                                .subscribe({
                                complete: () => {
                                    observer.next();
                                    observer.complete();
                                },
                                error: (err) => observer.error(err)
                            });
                        });
                    }
                    else {
                        console.log(folders ? `CONFIG_CERT_PATH env var not found.` : `Missing folders property in config.`);
                        observer.error('');
                    }
                });
            }
            else {
                console.log(`Something went wrong, unable to create /var/horizon file`);
                observer.error('');
            }
        });
    }
    removeCliContainer(name = 'hzn-cli') {
        return this.stopRemoveContainer(name);
    }
    removeAnaxContainer(name = 'horizon1') {
        return this.stopRemoveContainer(name);
    }
    stopRemoveContainer(name) {
        return this.shell(`docker container stop ${name} && docker container rm ${name}`);
    }
    installCliAndAnaxInContainers(configJson) {
        return new rxjs_1.Observable((observer) => {
            this.installAnaxInContainer(configJson)
                .subscribe({
                complete: () => {
                    this.installCliInContainer(configJson)
                        .subscribe({
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                },
                error: (err) => observer.error(err)
            });
        });
    }
    installAnaxInContainer(configJson) {
        return new rxjs_1.Observable((observer) => {
            this.installPrereq()
                .subscribe({
                complete: () => {
                    this.createHorizonSystemFiles(configJson)
                        .subscribe({
                        complete: () => {
                            if (configJson.anaxInContainer) {
                                let containerStr = this.replaceEnvTokens(configJson.anaxInContainer, configJson.org);
                                this.shell(containerStr)
                                    .subscribe({
                                    complete: () => {
                                        observer.complete();
                                    },
                                    error: (err) => {
                                        observer.error(err);
                                    }
                                });
                            }
                            else {
                                console.log('Missing anaxInContainer property in configuration file');
                                observer.error();
                            }
                        },
                        error: (err) => {
                            observer.error(err);
                        }
                    });
                },
                error: (err) => {
                    console.log('am i here');
                    observer.error(err);
                }
            });
        });
    }
    updateConfig(configFile) {
        return new rxjs_1.Observable((observer) => {
            try {
                const pEnv = process.env;
                let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
                const config = jsonfile_1.default.readFileSync(configFile);
                if (this.invalidTemplate(config)) {
                    observer.next('');
                    observer.complete();
                }
                const orgId = config['org']['HZN_ORG_ID'];
                const envHzn = interface_1.configTemplate.envHzn;
                const configLocal = config['local'];
                const envLocal = interface_1.configTemplate.envLocal;
                if (!hznJson[orgId]) {
                    hznJson[orgId] = {};
                }
                Object.keys(envHzn).forEach((key) => {
                    if (!hznJson[orgId][key]) {
                        hznJson[orgId][key] = {};
                    }
                    let obj = envHzn[key];
                    if (config[interface_1.keyMap[key]]) {
                        Object.keys(config[interface_1.keyMap[key]]).forEach((configKey) => {
                            if (obj[configKey]) {
                                hznJson[orgId][key][configKey] = config[interface_1.keyMap[key]][configKey] ? config[interface_1.keyMap[key]][configKey] : obj[configKey];
                            }
                            pEnv[configKey] = config[interface_1.keyMap[key]][configKey];
                        });
                    }
                    Object.keys(obj).forEach(objKey => {
                        if (!hznJson[orgId][key][objKey]) {
                            hznJson[orgId][key][objKey] = config[interface_1.keyMap[key]][objKey] ? config[interface_1.keyMap[key]][objKey] : obj[objKey];
                        }
                    });
                    // Object.keys(obj).forEach((objKey) => {
                    //   hznJson[orgId][key][objKey] = config[keyMap[key]][objKey] ? config[keyMap[key]][objKey] : obj[objKey]
                    //   pEnv[objKey] = hznJson[orgId][key][objKey]
                    // })
                });
                // console.log(hznJson)
                jsonfile_1.default.writeFileSync('.env-hzn.json', hznJson, { spaces: 2 });
                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 644 ${this.hznConfig}/.env-hzn.json`).then(() => {
                    console.log(`config files updated for ${orgId}`);
                    this.configJson = config;
                    let content = '';
                    Object.keys(envLocal).forEach((key) => {
                        if (content.length > 0) {
                            content += '\n';
                        }
                        content += interface_1.HorizonKeyMap[key] ? `${key}=${pEnv[interface_1.HorizonKeyMap[key]]}` : pEnv[key] ? `${key}=${pEnv[key]}` : configLocal && configLocal[key] ? `${key}=${configLocal[key]}` : `${key}=${envLocal[key]}`;
                    });
                    (0, fs_1.writeFileSync)('.env-local', content);
                    this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 644 ${this.hznConfig}/.env-local`).then(() => {
                        observer.next(config);
                        observer.complete();
                    });
                });
            }
            catch (e) {
                console.log(e);
                observer.error(e);
            }
        });
    }
    proceedWithAutoInstall(setup) {
        return new rxjs_1.Observable((observer) => {
            // console.log('hzn_css', pEnv.HZN_CSS, typeof pEnv.HZN_CSS, Boolean(pEnv.HZN_CSS))
            this.purgeManagementHub() // Leverage this functin to cleanup and install prerequisites, maynot need preInstallHznCli anymore
                .subscribe({
                complete: () => {
                    const pEnv = process.env;
                    let action = this.preInstallHznCli(pEnv.HZN_ORG_ID, pEnv.ANAX, pEnv.HZN_DEVICE_ID, pEnv.HZN_CSS, pEnv.HZN_DEVICE_TOKEN);
                    switch (setup) {
                        case interface_1.SetupEnvironment.autoSetup:
                            action = this.preInstallHznCli(pEnv.HZN_ORG_ID, pEnv.ANAX, pEnv.HZN_DEVICE_ID, pEnv.HZN_CSS, pEnv.HZN_DEVICE_TOKEN);
                            break;
                        case interface_1.SetupEnvironment.autoSetupCliOnly:
                            action = this.installCliOnly(pEnv.ANAX);
                            break;
                        case interface_1.SetupEnvironment.autoSetupAnaxInContainer:
                            action = this.installAnaxInContainer(this.configJson);
                            break;
                        case interface_1.SetupEnvironment.autoSetupCliInContainer:
                            action = this.installCliInContainer(this.configJson);
                            break;
                        case interface_1.SetupEnvironment.autoSetupContainer:
                            action = this.installCliAndAnaxInContainers(this.configJson);
                            break;
                        case interface_1.SetupEnvironment.autoSetupAllInOne:
                            action = this.setupManagementHub();
                            break;
                    }
                    action
                        .subscribe({
                        next: (msg) => console.log('next here'),
                        complete: () => {
                            console.log('done installing hzn cli.');
                            observer.complete();
                        },
                        error: (err) => {
                            console.log('err here');
                            observer.error(err);
                        }
                    });
                }, error: (err) => observer.error(err)
            });
        });
    }
    autoRun(configFile, setup) {
        return new rxjs_1.Observable((observer) => {
            if (!configFile || configFile.length == 0) {
                observer.next('Please provide --config_file name');
                observer.complete();
            }
            else {
                this.updateConfig(configFile)
                    .subscribe({
                    next: (json) => this.configJson = json,
                    complete: () => {
                        const pEnv = process.env;
                        const arg = 'hzn version';
                        this.shell(arg)
                            .subscribe({
                            next: (msg) => {
                                let answer = '';
                                console.log('hzn is already installed, please uninstallHorizon first.');
                                this.uninstallHorizon('Would you like to proceed to reinstall Horzion: Y/n?')
                                    .subscribe({
                                    next: (resp) => answer = resp,
                                    complete: () => {
                                        if (answer === 'Y') {
                                            this.proceedWithAutoInstall(setup)
                                                .subscribe({
                                                complete: () => {
                                                    observer.next('');
                                                    observer.complete();
                                                },
                                                error: (err) => observer.error(err)
                                            });
                                        }
                                        else {
                                            observer.next('');
                                            observer.complete();
                                        }
                                    }, error: (err) => {
                                        observer.next('');
                                        observer.complete();
                                    }
                                });
                            },
                            error: (err) => {
                                this.proceedWithAutoInstall(setup)
                                    .subscribe({
                                    complete: () => {
                                        observer.next('');
                                        observer.complete();
                                    },
                                    error: (err) => observer.error(err)
                                });
                            }
                        });
                    },
                    error: (err) => observer.error(err)
                });
            }
        });
    }
    replaceEnvTokens(input, tokens) {
        let envTokens = {};
        Object.keys(tokens).forEach((key) => {
            envTokens[key] = process.env[key];
        });
        this.tokenReplace(input, envTokens);
        return input;
    }
    autoSetup(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetup);
    }
    autoSetupCliOnly(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetupCliOnly);
    }
    autoSetupAnaxInContainer(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetupAnaxInContainer);
    }
    autoSetupCliInContainer(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetupCliInContainer);
    }
    autoSetupContainer(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetupContainer);
    }
    autoSetupAllInOne(configFile) {
        return this.autoRun(configFile, interface_1.SetupEnvironment.autoSetupAllInOne);
    }
    getEtcDefault() {
        return this.etcDefault;
    }
    getHznConfig() {
        return this.hznConfig;
    }
    listAgreement(param) {
        const arg = `${param.watch} hzn agreement list`;
        return this.shell(arg);
    }
    listService(param) {
        return new rxjs_1.Observable((observer) => {
            this.listAllServices(param)
                .subscribe({
                next: (res) => {
                    const pEnv = process.env;
                    let services = res.replace(/\r?\n|\r|\[|\]|"/g, '').split(',');
                    let filter = param.filter && param.filter.length > 0 ? param.filter : pEnv.ARCH;
                    let archFilter = services.filter((r) => r.indexOf(filter) > 0);
                    if (archFilter.length < services.length) {
                        console.log(`Services for ${filter}:\n${archFilter.join(',\n')}`);
                    }
                    observer.next('');
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    removeService(name) {
        return new rxjs_1.Observable((observer) => {
            const arg = `yes | hzn exchange service remove ${name}`;
            const msg = `\nAre you sure you want to remove ${name} service from the Horizon Exchange? [y/N]:`;
            this.areYouSure(arg, msg)
                .subscribe({
                complete: () => {
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    listAllServices(param) {
        const arg = param.name.length > 0 ? `hzn exchange service list ${param.name} --org ${param.org}` : `hzn exchange service list --org ${param.org}`;
        return param.name.length > 0 ? this.shell(arg, 'commande executed successfully', 'failed to execute command', false) : this.shell(arg);
    }
    listPattern(name) {
        const arg = name.length > 0 ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listNode(param) {
        const arg = 'hzn node list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listNodes(param) {
        const arg = 'hzn exchange node list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listOrg(param) {
        const arg = 'hzn exchange org list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listExchangeNode(param) {
        const arg = param.name.length > 0 ? `hzn exchange node list ${param.name}` : 'hzn exchange node list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listPolicy() {
        const arg = 'hzn policy list';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listExchangeNodePolicy(param) {
        const arg = `hzn exchange node listpolicy ${param.name}`;
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listServicePolicy(name) {
        const arg = `hzn exchange service listpolicy ${name}`;
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    listDeploymentPolicy(name) {
        const arg = name.length > 0 ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
        return this.shell(arg, 'commande executed successfully', 'failed to execute command', false);
    }
    removeDeploymentPolicy(name) {
        return new rxjs_1.Observable((observer) => {
            const arg = `yes | hzn exchange deployment removepolicy ${name}`;
            const msg = `\nAre you sure you want to remove ${name} deployment policy from the Horizon Exchange? [y/N]:`;
            this.areYouSure(arg, msg)
                .subscribe({
                complete: () => {
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    areYouSure(arg, msg) {
        return new rxjs_1.Observable((observer) => {
            console.log(msg);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    this.shell(arg)
                        .subscribe({
                        complete: () => {
                            observer.complete();
                        },
                        error: (err) => observer.error(err)
                    });
                }
                else {
                    observer.complete();
                }
            });
        });
    }
    removeNode(name) {
        return new rxjs_1.Observable((observer) => {
            const arg = `yes | hzn exchange node remove ${name}`;
            const msg = `\nAre you sure you want to remove node ${name} from the Horizon Exchange? [y/N]:`;
            this.areYouSure(arg, msg)
                .subscribe({
                complete: () => {
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    listObject(param) {
        const arg = param.name.length > 0 ? `${param.watch}hzn mms object list ${param.name}` : `${param.watch}hzn mms object list -t ${param.objectType} -i ${param.objectId} -d`;
        return _1.utils.shell(arg, 'done listing object', 'failed to list object', false);
    }
    removeObject(param) {
        return new rxjs_1.Observable((observer) => {
            const object = `--type=${param.objectType} --id=${param.objectId}`;
            const arg = `yes | hzn mms object delete ${object}`;
            const msg = `\nAre you sure you want to remove object with ${object} from MMS? [y/N]:`;
            this.areYouSure(arg, msg)
                .subscribe({
                complete: () => {
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
    createHznKey(org, id) {
        if (org && id) {
            return this.shell(`hzn key create ${org} ${id} -f`);
        }
        else {
            console.log('please provide both <YOUR_DOCKERHUB_ID> and <HZN_ORG_ID> in .env-hzn.json');
            return (0, rxjs_1.of)();
        }
    }
    checkConfigState() {
        const arg = `hzn node list | jq '.configstate.state,.organization,.configuration.exchange_api,.configuration.mms_api'`;
        return this.shell(arg, 'check node configure state', 'failed to execute', true);
    }
    listNodePattern() {
        return this.shell(`hzn node list | jq .pattern`);
    }
    getDeviceArch() {
        return this.shell(`hzn architecture`);
    }
    checkOS() {
        return this.shell(`cat /etc/os-release`);
    }
    getIpAddress() {
        return Object.keys(ifs)
            .map(x => [x, ifs[x].filter(x => x.family === 'IPv4')[0]])
            .filter(x => x[1])
            .map(x => x[1].address);
    }
    aptUpdate() {
        // TODO, if failed run sudo apt-get -y --fix-missing full-upgrade
        // cat info.cfg
        return this.shell(`sudo apt-get -y update && sudo apt-get -yq install jq curl git`);
    }
    installPrereq() {
        if (process.platform == 'darwin') {
            return (0, rxjs_1.of)('MacOS...');
        }
        return new rxjs_1.Observable((observer) => {
            this.aptUpdate()
                .subscribe({
                complete: () => {
                    console.log('am i here');
                    observer.complete();
                },
                error: () => observer.complete() // Ignore errors
            });
        });
    }
    purgeManagementHub() {
        const arg = `curl -sSL https://raw.githubusercontent.com/open-horizon/devops/master/mgmt-hub/deploy-mgmt-hub.sh --output deploy-mgmt-hub.sh && chmod +x deploy-mgmt-hub.sh && sudo ./deploy-mgmt-hub.sh -PS && sudo rm -rf /tmp/horizon-all-in-1`;
        return this.shell(arg);
    }
    cleanUp() {
        console.log('cleaning up', (0, fs_1.existsSync)(`${this.etcDefault}/horizon`), (0, fs_1.existsSync)(this.etcHorizon), this.etcHorizon);
        let arg = (0, fs_1.existsSync)(`${process.cwd()}/agent-install.cfg`) ? `sudo rm ${process.cwd()}/agent-install.* -f -y || true && ` : '';
        arg += (0, fs_1.existsSync)(this.etcHorizon) ? `sudo rm -rf ${this.etcHorizon} -y || true && ` : '';
        arg += (0, fs_1.existsSync)(`${this.etcDefault}/horizon`) ? `sudo rm ${this.etcDefault}/horizon || true && ` : '';
        arg += (0, fs_1.existsSync)(`${this.homePath}/.hzn`) ? `sudo rm -rf ${this.homePath}/.hzn -y || true && ` : '';
        arg += ':';
        return this.shell(arg);
    }
    installCliOnly(anax) {
        const tarFile = process.platform == 'darwin' ? interface_1.installTar['darwin'] : interface_1.installTar[os_1.default.arch()];
        console.log(tarFile, process.cwd());
        process.env['INPUT_FILE_PATH'] = process.cwd();
        if (anax && anax.indexOf('open-horizon') > 0) {
            anax = anax.replace('/agent-install.sh', '');
            const arg = `curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${tarFile} -o ${tarFile} && tar -zxvf ${tarFile}`;
            return this.shell(`${arg} && sudo curl -sSL ${anax}/agent-install.sh -o agent-install.sh && sudo chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -C`);
        }
        else {
            // anax = api/v1/objects/IBM/agent_files/agent-install.sh/data
            return this.shell(`sudo curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/${anax} && sudo chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -i 'css:' -C`);
        }
    }
    installHznCli(anax, id, css, deviceToken = '') {
        const token = deviceToken.length > 0 ? deviceToken : 'some-device-token';
        console.log(css, typeof css);
        let nodeId = id && id.length > 0 ? `-a ${id}:${token}` : `-a ${os_1.default.hostname}:${token}`;
        if (anax && anax.indexOf('open-horizon') > 0) {
            // NOTE: for Open Horizon anax would be https://github.com/open-horizon/anax/releases/latest/download
            let tag = css === 'true' ? 'css:' : 'anax:';
            if (anax.indexOf('latest') < 0) {
                tag = anax.replace('download', 'tag');
            }
            anax = anax.replace('/agent-install.sh', '');
            return this.shell(`sudo touch /etc/default/horizon && sudo curl -sSL ${anax}/agent-install.sh | sudo -s -E bash -s -- -i ${tag} ${nodeId} -k css: -c css:`);
        }
        else {
            // anax = api/v1/objects/IBM/agent_files/agent-install.sh/data
            return this.shell(`sudo curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/${anax} && sudo chmod +x agent-install.sh && sudo -s -E -b ./agent-install.sh -i 'css:' ${nodeId}`);
        }
    }
    uninstallHorizon(msg = 'Would you like to proceed to uninstall Horzion: Y/n?', yes = 'yes |') {
        // TODO:  Weird, have to force yes otherwise the script will hang
        return new rxjs_1.Observable((observer) => {
            console.log(`\n${msg}`);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                const resp = question.answer.toUpperCase();
                if (resp === 'Y') {
                    let arg = `sudo apt-get purge -y bluehorizon horizon horizon-cli && sudo rm agent-install.* -y`;
                    if (process.platform == 'darwin') {
                        arg = `${yes} sudo /Users/Shared/horizon-cli/bin/horizon-cli-uninstall.sh && sudo pkgutil --forget com.github.open-horizon.pkg.horizon-cli`;
                    }
                    this.shell(arg)
                        .subscribe({
                        complete: () => {
                            this.cleanUp()
                                .subscribe({
                                complete: () => {
                                    observer.next(resp);
                                    observer.complete();
                                },
                                error: (err) => {
                                    observer.next(resp);
                                    observer.complete();
                                }
                            });
                        },
                        error: (err) => {
                            this.cleanUp()
                                .subscribe({
                                complete: () => {
                                    observer.next(resp);
                                    observer.complete();
                                },
                                error: (err) => {
                                    observer.next(resp);
                                    observer.complete();
                                }
                            });
                        }
                    });
                }
                else {
                    observer.next(resp);
                    observer.complete();
                }
            });
        });
    }
    setupManagementHub() {
        return new rxjs_1.Observable((observer) => {
            let ips = this.getIpAddress();
            const pEnv = process.env;
            const orgId = pEnv.HZN_ORG_ID ? pEnv.HZN_ORG_ID : 'myorg';
            const props = [
                { name: 'HZN_LISTEN_IP', default: ips ? ips[0] : '', ipList: ips, required: true },
                { name: 'HZN_TRANSPORT', default: 'https', required: true },
                { name: 'EXCHANGE_IMAGE_NAME', default: '', required: false },
                { name: 'OH_ANAX_RELEASES', default: 'https://github.com/open-horizon/anax/releases/latest/download', required: true },
                { name: 'EXCHANGE_USER_ORG', default: orgId, required: true }
            ];
            console.log(props);
            console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
            prompt_1.default.get(props, (err, result) => {
                console.dir(result, { depth: null, color: true });
                // TODO: refactor following into a reusable function
                const template = { name: '', value: '' };
                let propName = 'environment variable';
                let answer;
                do {
                    answer = (0, exports.promptSync)(`Would you like to add additional ${propName}: Y/n? `);
                    if (answer.toLowerCase() == 'y') {
                        this.promptType(propName, result, template);
                    }
                } while (answer.toLowerCase() == 'y');
                console.dir(result, { depth: null, color: true });
                answer = (0, exports.promptSync)(`\nWould you like to proceed to install Management Hub: Y/n?`);
                if (answer.toLowerCase() == 'y') {
                    for (const [key, value] of Object.entries(result)) {
                        pEnv[key] = value;
                    }
                    this.shell(`curl -sSL https://raw.githubusercontent.com/open-horizon/devops/master/mgmt-hub/deploy-mgmt-hub.sh --output deploy-mgmt-hub.sh && chmod +x deploy-mgmt-hub.sh && sudo -s -E -b ./deploy-mgmt-hub.sh`)
                        .subscribe({
                        next: (res) => {
                            (0, fs_1.writeFileSync)(`${this.hznConfig}/.secret`, res);
                        },
                        complete: () => observer.complete(),
                        error: (err) => {
                            if (err.indexOf('400 from: vaultUnseal') > 0) {
                                console.log('You might want to purge existing instance by running "oh deploy purgeManagementHub.');
                            }
                            observer.error(err);
                        }
                    });
                }
            });
        });
    }
    copyFile(arg) {
        return (0, rxjs_1.firstValueFrom)(this.shell(arg));
    }
    appendSupport() {
        return new rxjs_1.Observable((observer) => {
            let props = this.getPropsFromFile(`${this.hznConfig}/.env-support`);
            console.log(props);
            console.log(`\nWould you like to change any of the above properties: Y/n?`);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
                    prompt_1.default.get(props, (err, result) => {
                        console.log(result);
                        console.log(`\nWould you like to update append support files: Y/n?`);
                        prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                            let content = '';
                            for (const [key, value] of Object.entries(result)) {
                                content += `${key}=${value}\n`;
                            }
                            (0, fs_1.writeFileSync)('.env-support', content);
                            this.copyFile(`sudo mv .env-support ${this.hznConfig}/.env-support && sudo chmod 766 ${this.hznConfig}/.env-support`).then(() => {
                                observer.complete();
                            }).catch((err) => {
                                observer.error(err);
                            });
                        });
                    });
                }
                else {
                    observer.complete();
                }
            });
        });
    }
    getPropsFromEnvLocal(org) {
        let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
        let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
        if (hznJson[org] && hznJson[org]['credential']) {
            let credential = hznJson[org]['credential'];
            Object.keys(credential).forEach((key) => {
                props.some((el, idx) => {
                    if (el.name === key && credential[key] && credential[key].length > 0) {
                        props[idx].default = credential[key];
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            });
        }
        return props;
    }
    updateEnvFiles(org) {
        return new rxjs_1.Observable((observer) => {
            // let props = this.getPropsFromFile(`${this.hznConfig}/.env-local`);
            const props = this.getPropsFromEnvLocal(org);
            console.log(props);
            props.forEach((prop, idx) => {
                if (props[idx].name == 'DEFAULT_ORG') {
                    props[idx].default = org;
                }
            });
            console.log(`\nWould you like to change any of the above properties: Y/n?`);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
                    prompt_1.default.get(props, (err, result) => {
                        result = this.filterEnvVars(result);
                        console.dir(result, { depth: null, color: true });
                        const template = { name: '', value: '' };
                        let propName = 'environment variable';
                        let answer;
                        do {
                            answer = (0, exports.promptSync)(`Would you like to add additional ${propName}: Y/n? `);
                            if (answer.toLowerCase() == 'y') {
                                this.promptType(propName, result, template);
                            }
                        } while (answer.toLowerCase() == 'y');
                        answer = (0, exports.promptSync)(`\nWould you like to update config files: Y/n?`);
                        if (answer.toLowerCase() == 'y') {
                            let content = '';
                            const pEnv = process.env;
                            for (const [key, value] of Object.entries(result)) {
                                content += key == 'DEFAULT_ORG' ? `${key}=${org}\n` : `${key}=${value}\n`;
                                pEnv[key] = '' + value;
                            }
                            (0, fs_1.writeFileSync)('.env-local', content);
                            this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
                                this.updateAndSaveCredential(org, content)
                                    .subscribe({
                                    complete: () => {
                                        this.switchEnvironment(org, pEnv)
                                            .subscribe({
                                            complete: () => observer.complete(),
                                            error: (err) => observer.error(err)
                                        });
                                    }, error: (err) => observer.error(err)
                                });
                            });
                        }
                        else {
                            observer.complete();
                        }
                    });
                }
                else {
                    this.updateEnvHzn(org)
                        .subscribe({
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                }
            });
        });
    }
    switchEnvironment(org, pEnv = process.env) {
        return new rxjs_1.Observable((observer) => {
            if (pEnv.ANAX_IN_CONTAINER == 'true') {
                console.log('Anax in container', pEnv.ANAX_IN_CONTAINER);
                observer.next();
                observer.complete();
            }
            else {
                let answer;
                this.checkConfigState()
                    .subscribe({
                    next: (res) => {
                        console.log('configure', res.replace(/"/g, '').split('\n'));
                        let resNode = res.replace(/"/g, '').split('\n');
                        let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
                        if (resNode && resNode[0].length > 0 && resNode[0] === 'configured' && (resNode[1] !== org || resNode[2].indexOf(hznJson[org].credential.HZN_EXCHANGE_URL) < 0)) {
                            console.log(hznJson[org].credential.HZN_EXCHANGE_URL, resNode[2], resNode[2].indexOf(hznJson[org].credential.HZN_EXCHANGE_URL));
                            answer = (0, exports.promptSync)(`\nThis node is registered with ${resNode[1]}, must unregister before switching to ${org}, unregister Y/n? `);
                            if (answer.toLowerCase() == 'y') {
                                this.uninstallHorizon('Would you like to proceed to reinstall Horzion: Y/n?')
                                    .subscribe({
                                    complete: () => {
                                        if (!pEnv.HZN_ORG_ID) {
                                            pEnv.HZN_ORG_ID = pEnv.DEFAULT_ORG;
                                        }
                                        let nodeId = pEnv.HZN_CUSTOM_NODE_ID ? pEnv.HZN_CUSTOM_NODE_ID : '';
                                        pEnv.NODE_ID = nodeId;
                                        this.installHznCli(pEnv.ANAX, nodeId, pEnv.HZN_CSS)
                                            .subscribe({
                                            complete: () => observer.complete(),
                                            error: (err) => observer.error(err)
                                        });
                                    }, error: (err) => observer.error(err)
                                });
                            }
                            else {
                                observer.error('do nothing.');
                            }
                        }
                        else {
                            observer.next();
                            observer.complete();
                        }
                    },
                    error: (err) => observer.error(err)
                });
            }
        });
    }
    updateAndSaveCredential(org, content) {
        return new rxjs_1.Observable((observer) => {
            this.updateCredential(org);
            (0, fs_1.writeFileSync)('.env-local', content);
            this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
                this.updateEnvHzn(org)
                    .subscribe({
                    complete: () => observer.complete(),
                    error: (err) => observer.error(err)
                });
            });
        });
    }
    shallowEqual(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        let diff = false;
        keys1.some((key) => {
            diff = obj1[key] !== obj2[key];
            return diff;
        });
        return !diff;
    }
    promptCliOrAnax(msg = `Install CLI only (Y/n):  `) {
        let answer;
        do {
            answer = (0, exports.promptSync)(msg).toUpperCase();
            if (answer != 'Y' && answer != 'N') {
                console.log('Y/n', '\nInvalid, try again.');
            }
        } while (answer != 'Y' && answer != 'N');
        return answer;
    }
    installAnaxOrCli(container = true) {
        return new rxjs_1.Observable((observer) => {
            console.log(os_1.default.arch());
            let props = [];
            let i = 0;
            for (const [key, value] of Object.entries(interface_1.installPrompt)) {
                props[i] = { name: key, default: value, required: true };
                if (key.indexOf('version') >= 0) {
                    props[i]['pattern'] = /^(css|latest|(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$)$/;
                    props[i]['message'] = 'Must be css, latest or version #';
                }
                i++;
            }
            prompt_1.default.get(props, (err, result) => {
                result = this.filterEnvVars(result);
                console.dir(result, { depth: null, color: true });
                observer.next();
                observer.complete();
            });
        });
    }
    updateOrgConfig(hznJson, org, newOrg = false) {
        return new rxjs_1.Observable((observer) => {
            let props = [];
            let envVars = hznJson[org]['envVars'];
            let i = 0;
            let pkg;
            if ((0, fs_1.existsSync)('./package.json')) {
                try {
                    pkg = jsonfile_1.default.readFileSync('./package.json');
                }
                catch (e) {
                    console.log(e);
                }
            }
            console.log('$$herer', __dirname);
            for (const [key, value] of Object.entries(envVars)) {
                if (pkg && pkg.version && (key == 'SERVICE_VERSION' || key == 'MMS_SERVICE_VERSION')) {
                    props[i] = { name: key, default: value, package: pkg.version, required: notRequired.indexOf(key) < 0 };
                }
                else {
                    props[i] = { name: key, default: value, required: notRequired.indexOf(key) < 0 };
                }
                if (isBoolean.indexOf(key) >= 0) {
                    props[i]['pattern'] = /^(true|false)$/;
                    props[i]['message'] = 'Must be true or false';
                }
                i++;
            }
            console.log(props);
            console.log(`\nWould you like to change any of the above properties for ${org}: Y/n?`);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
                    prompt_1.default.get(props, (err, result) => {
                        result = this.filterEnvVars(result);
                        console.dir(result, { depth: null, color: true });
                        const template = { name: '', value: '' };
                        let propName = 'environment variable';
                        let answer;
                        do {
                            answer = (0, exports.promptSync)(`Would you like to add additional ${propName}: Y/n? `);
                            if (answer.toLowerCase() == 'y') {
                                this.promptType(propName, result, template);
                            }
                        } while (answer.toLowerCase() == 'y');
                        console.log(`\nWould you like to save these changes: Y/n?`);
                        prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                            if (question.answer.toUpperCase() === 'Y') {
                                for (const [key, value] of Object.entries(result)) {
                                    envVars[key] = value;
                                }
                                jsonfile_1.default.writeFileSync('.env-hzn.json', hznJson, { spaces: 2 });
                                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
                                    console.log(`config files updated for ${org}`);
                                    observer.next({ env: org });
                                    observer.complete();
                                });
                            }
                            else {
                                console.log(`config files not updated/created for ${org}`);
                                observer.error(`config files not updated/created for ${org}`);
                            }
                        });
                    });
                }
                else {
                    if (newOrg) {
                        console.log(`\nWould you like to save config for ${org}: Y/n?`);
                        prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                            if (question.answer.toUpperCase() === 'Y') {
                                jsonfile_1.default.writeFileSync('.env-hzn.json', hznJson, { spaces: 2 });
                                this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
                                    console.log(`config files updated for ${org}`);
                                    observer.next({ env: org });
                                    observer.complete();
                                });
                            }
                            else {
                                observer.error(`config files not updated for ${org}`);
                            }
                        });
                    }
                    else {
                        console.log(`config files not updated for ${org}`);
                        observer.next({ env: org });
                        observer.complete();
                    }
                }
            });
        });
    }
    removeOrg(org) {
        return new rxjs_1.Observable((observer) => {
            let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
            if (hznJson[org]) {
                console.log(hznJson[org]);
                console.log(`\nAre you sure you want to delete ${org}: Y/n?`);
                prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                    if (question.answer.toUpperCase() === 'Y') {
                        delete (hznJson[org]);
                        jsonfile_1.default.writeFileSync('.env-hzn.json', hznJson, { spaces: 2 });
                        this.copyFile(`sudo mv .env-hzn.json ${this.hznConfig}/.env-hzn.json && sudo chmod 766 ${this.hznConfig}/.env-hzn.json`).then(() => {
                            console.log(`config files updated, ${org} has been removed`);
                            observer.complete();
                        });
                    }
                });
            }
            else {
                observer.error(`${org} doesn't exist in your environment config.`);
            }
        });
    }
    updateCredential(org) {
        let credential = {};
        const pEnv = process.env;
        let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
        credentialVars.forEach((key) => {
            credential[key] = pEnv[key];
            console.log(key, pEnv[key]);
        });
        if (!hznJson[org]) {
            let template = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/env-hzn-template.json`).toString());
            hznJson[org] = template.properties;
        }
        if (!hznJson[org]['credential']) {
            hznJson[org]['credential'] = {};
        }
        if (!this.shallowEqual(credential, hznJson[org]['credential'])) {
            hznJson[org]['credential'] = credential;
            jsonfile_1.default.writeFileSync(`${this.hznConfig}/.env-hzn.json`, hznJson, { spaces: 2 });
            console.log('update credential');
        }
    }
    orgCheck(org, skipUpdate = false) {
        return new rxjs_1.Observable((observer) => {
            let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
            if (hznJson[org]) {
                if (!skipUpdate) {
                    this.updateOrgConfig(hznJson, org)
                        .subscribe({
                        next: () => observer.next({ env: org }),
                        complete: () => observer.complete(),
                        error: (err) => observer.error(err)
                    });
                }
                else {
                    observer.complete();
                }
            }
            else {
                console.log(`\n${org} is not setup in your envvironment, would you like to set it up: Y/n?`);
                prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                    if (question.answer.toUpperCase() === 'Y') {
                        hznJson[org] = Object.assign({}, hznJson.biz);
                        this.updateOrgConfig(hznJson, org, true)
                            .subscribe({
                            next: () => observer.next({ env: org }),
                            complete: () => observer.complete(),
                            error: (err) => observer.error(err)
                        });
                    }
                    else {
                        observer.error(`config files are not setup for ${org}`);
                    }
                });
            }
        });
    }
    filterEnvVars(result) {
        let res = {};
        for (const [key, value] of Object.entries(result)) {
            if (typeof value === 'string' && (value.trim().length > 0 || mustHave.indexOf(key) >= 0)) {
                res[key] = value.trim();
            }
            else {
                delete process.env[key];
            }
        }
        return res;
    }
    setupEnvFiles(org) {
        return new rxjs_1.Observable((observer) => {
            // console.log(process.cwd(), __dirname, __filename)
            let props = this.getPropsFromFile(`${__dirname}/env-local`);
            Object.values(props).some((el) => {
                if (el.name == 'DEFAULT_ORG') {
                    el.default = org;
                    return true;
                }
                else {
                    return false;
                }
            });
            console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
            prompt_1.default.get(props, (err, result) => {
                result = this.filterEnvVars(result);
                console.log(result);
                console.log(`\nWould you like to save config files: Y/n?`);
                prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                    if (question.answer.toUpperCase() === 'Y') {
                        // Copy config/* to user home
                        let arg = '';
                        if (!(0, fs_1.existsSync)(this.hznConfig)) {
                            arg = `sudo cp -rf ${__dirname}/hzn-config ${this.homePath} && sudo chown -R $(whoami) ${this.hznConfig} && cp ${__dirname}/env-support ${this.hznConfig}/.env-support`;
                        }
                        else if (!(0, fs_1.existsSync)(`${this.hznConfig}/.env-support`)) {
                            arg = `cp ${__dirname}/env-support ${this.hznConfig}/.env-support`;
                        }
                        this.copyFile(arg).then(() => {
                            let content = '';
                            for (const [key, value] of Object.entries(result)) {
                                content += `${key}=${value}\n`;
                                if (key === 'DEFAULT_ORG') {
                                    org = `${value}`;
                                    process.env.HZN_ORG_ID = org;
                                }
                            }
                            (0, fs_1.writeFileSync)('.env-local', content);
                            this.copyFile(`sudo mv .env-local ${this.hznConfig}/.env-local && sudo chmod 766 ${this.hznConfig}/.env-local`).then(() => {
                                this.copyFile(`sudo cp ${__dirname}/env-hzn.json ${this.hznConfig}/.env-hzn.json`).then(() => {
                                    this.orgCheck(org)
                                        .subscribe({
                                        next: () => observer.next({ env: org }),
                                        complete: () => observer.complete(),
                                        error: (err) => observer.error(err)
                                    });
                                });
                            });
                        });
                    }
                    else {
                        console.log(`config files not saved`);
                        observer.error();
                    }
                });
            });
        });
    }
    updateEnvHzn(org) {
        return new rxjs_1.Observable((observer) => {
            this.orgCheck(org)
                .subscribe({
                complete: () => observer.complete(),
                error: (err) => observer.complete()
            });
        });
    }
    checkSystemFiles() {
        return new Promise((resolve, reject) => {
            console.log('checking config files are in tact');
            let cwd = __dirname;
            let files = {
                env: ['env-hzn.json', 'env-local', 'env-support'],
                json: ['deployment.policy.json', 'service.policy.json', 'node.policy.json', 'object.policy.json']
            };
            if (!(0, fs_1.existsSync)(this.hznConfig)) {
                (0, fs_1.mkdirSync)(this.hznConfig);
            }
            files.env.forEach((f) => {
                if (!(0, fs_1.existsSync)(`${this.hznConfig}/.${f}`)) {
                    (0, fs_1.copyFileSync)(`${cwd}/${f}`, `${this.hznConfig}/.${f}`);
                }
            });
            files.json.forEach((f) => {
                if (!(0, fs_1.existsSync)(`${this.hznConfig}/${f}`)) {
                    (0, fs_1.copyFileSync)(`${cwd}/hzn-config/${f}`, `${this.hznConfig}/${f}`);
                }
            });
            if (!(0, fs_1.existsSync)(`${this.hznConfig}/services`)) {
                let arg = `cp -R ${cwd}/hzn-config/services ${this.hznConfig}`;
                _1.utils.shell(arg)
                    .subscribe({
                    complete: () => resolve('done checking...'),
                    error: (err) => resolve('done checking...')
                });
            }
            else {
                resolve('done checking...');
            }
        });
    }
    checkDefaultConfig() {
        return new rxjs_1.Observable((observer) => {
            (async () => {
                await _1.utils.checkSystemFiles();
                if ((0, fs_1.existsSync)(`${this.hznConfig}/.env-local`) && (0, fs_1.existsSync)(`${this.hznConfig}/.env-hzn.json`) && (0, fs_1.existsSync)(`${this.hznConfig}/.env-support`)) {
                    observer.complete();
                }
                else {
                    observer.error('No config files.  Please run "oh deploy setup"');
                }
            })();
        });
    }
    getHznInfo() {
        return (0, fs_1.readFileSync)(`${this.etcDefault}/horizon`).toString().split('\n');
    }
    showHznInfo() {
        return new rxjs_1.Observable((observer) => {
            const file = this.getHznInfo();
            console.log(file);
            observer.next(file);
            observer.complete();
        });
    }
    getPropValueFromFile(file, prop) {
        let value = '';
        try {
            if ((0, fs_1.existsSync)(file)) {
                let data = (0, fs_1.readFileSync)(file).toString().split('\n');
                Object.values(data).some((el) => {
                    let ar = el.split('=');
                    if (ar && ar.length > 0 && ar[0] == prop) {
                        value = ar[1];
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        return value;
    }
    getPropsFromFile(file) {
        let props = [];
        try {
            if ((0, fs_1.existsSync)(file)) {
                let data = (0, fs_1.readFileSync)(file).toString().split('\n');
                data.forEach((el, i) => {
                    if (el.length > 0) {
                        let prop = el.split('=');
                        if (prop && prop.length > 0) {
                            if (prop[0] === 'HZN_CUSTOM_NODE_ID' && (!prop[1] || prop[1].length == 0)) {
                                prop[1] = os_1.default.hostname();
                            }
                            props[i] = { name: prop[0], default: prop[1], required: notRequired.indexOf(prop[0]) < 0 };
                            if (isBoolean.indexOf(prop[0]) >= 0) {
                                props[i]['pattern'] = /^(true|false)$/;
                                props[i]['message'] = 'Must be true or false';
                            }
                        }
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
            props = [];
        }
        return props;
    }
    updateHorizon(org, pEnv) {
        return new rxjs_1.Observable((observer) => {
            let horizon = this.nameValueToJson(`${this.etcDefault}/horizon`);
            let hznJson = JSON.parse((0, fs_1.readFileSync)(`${this.hznConfig}/.env-hzn.json`).toString());
            console.log('check update', org, hznJson[org].credential.HZN_FSS_CSSURL, horizon.HZN_FSS_CSSURL);
            if (hznJson[org].credential.HZN_FSS_CSSURL && hznJson[org].credential.HZN_FSS_CSSURL != horizon.HZN_FSS_CSSURL) {
                let template = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/env-hzn-template.json`).toString());
                let url = new url_1.URL(hznJson[org].credential.HZN_FSS_CSSURL);
                let type = url.port ? template['oh'] : template['ieam'];
                let hostname = `${url.protocol}//${url.hostname}`;
                let content = '';
                Object.keys(type).forEach((key) => {
                    content += `${key}=${this.tokenReplace(type[key], { HOSTNAME: hostname, HZN_DEVICE_ID: horizon.HZN_DEVICE_ID, HZN_NODE_ID: horizon.HZN_NODE_ID })}\n`;
                });
                console.log('update horizon');
                console.log(content);
                this.updateCert(org, pEnv)
                    .subscribe({
                    complete: () => {
                        //todo writeHorizon
                        this.writeHorizon(content)
                            .subscribe(() => observer.complete());
                    }, error: (err) => observer.error(err)
                });
            }
            else {
                observer.next();
                observer.complete();
            }
        });
    }
    updateCert(org, pEnv) {
        return new rxjs_1.Observable((observer) => {
            if ((0, fs_1.existsSync)(`${this.etcHorizon}/agent-install-${org}.crt`)) {
                // todo cp to agent-install.crt
                this.copyFile(`sudo cp ${this.etcHorizon}/agent-install-${org}.crt ${this.etcHorizon}/agent-install.crt`).then(() => {
                    observer.complete();
                });
            }
            else {
                let arg = `sudo curl -sSL -u "${pEnv.getOrgId()}/${pEnv.getExchangeUserAuth()}" --insecure -o "${this.etcHorizon}/agent-install-${org}.crt" ${pEnv.getFSSCSSUrl()}/api/v1/objects/IBM/agent_files/agent-install.crt/data`;
                this.shell(arg, 'done updating cert', 'failed to update cert')
                    .subscribe({
                    complete: () => {
                        // todo cp to agent-install.crt
                        this.copyFile(`sudo cp ${this.etcHorizon}/agent-install-${org}.crt ${this.etcHorizon}/agent-install.crt`).then(() => {
                            observer.complete();
                        });
                    }, error: (err) => observer.error(err)
                });
            }
        });
    }
    tokenReplace(template, obj) {
        //  template = 'Where is ${movie} playing?',
        //  tokenReplace(template, {movie: movie});
        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, (match, key) => {
            return obj[key];
        });
    }
    writeHorizon(content) {
        return new rxjs_1.Observable((observer) => {
            this.copyFile(`sudo cp ${this.etcDefault}/horizon ${this.etcDefault}/.horizon`).then(() => {
                (0, fs_1.writeFileSync)('.horizon', content);
                this.copyFile(`sudo mv .horizon ${this.etcDefault}/horizon`).then(() => {
                    observer.next();
                    observer.complete();
                });
            });
        });
    }
    nameValueToJson(file) {
        let ar = (0, fs_1.readFileSync)(file).toString().split('\n');
        let json = Object.assign({});
        ar.forEach((el) => {
            let prop = el.split('=');
            json[prop[0]] = prop[1];
        });
        return json;
    }
    updateHznInfo() {
        return new rxjs_1.Observable((observer) => {
            let props = this.getPropsFromFile(`${this.etcDefault}/horizon`);
            console.log('\nKey in new value or (leave blank) press Enter to keep current value: ');
            prompt_1.default.get(props, (err, result) => {
                console.log(result);
                console.log('\nWould you like to update horizon: Y/n?');
                prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                    if (question.answer.toUpperCase() === 'Y') {
                        let content = '';
                        for (const [key, value] of Object.entries(result)) {
                            content += `${key}=${value}\n`;
                        }
                        this.copyFile(`sudo cp ${this.etcDefault}/horizon ${this.etcDefault}/.horizon`).then(() => {
                            (0, fs_1.writeFileSync)('.horizon', content);
                            this.copyFile(`sudo mv .horizon ${this.etcDefault}/horizon`).then(() => {
                                observer.next();
                                observer.complete();
                            });
                        });
                    }
                    else {
                        observer.complete();
                    }
                });
            });
        });
    }
    policyToProps(policy) {
        let props = {};
        let keys = Object.keys(policy);
        keys.forEach((key) => {
            props[key] = [];
            policy[key].forEach((el, i) => {
                if (key === 'properties') {
                    props[key].push({ name: el.name, value: el.value });
                }
                else {
                    props[key].push({ value: el });
                }
            });
        });
        console.dir(props, { depth: null, colors: true });
        return props;
    }
    promptType(propName, res, el) {
        let name;
        let value;
        if (propName === 'properties' || propName === 'environment variable') {
            name = (0, exports.promptSync)(`name (${el.name}): `, { value: el.name });
            value = (0, exports.promptSync)(`value (${el.value}): `, { value: el.value });
            if (typeof value == 'string' ? name.trim().length > 0 && value.trim().length > 0 : name.trim().length > 0) {
                if (propName === 'properties') {
                    res.push({ name: name, value: value });
                }
                else {
                    res[name] = value;
                }
            }
        }
        else {
            console.dir(el, { depth: null, color: true });
            value = (0, exports.promptSync)(`constraint (${el.value}): `, { value: el.value });
            if (value && value.trim().length > 0) {
                res.push(value);
            }
        }
    }
    goPrompt(props, propName) {
        return new Promise(async (resolve, reject) => {
            let res = [];
            let name;
            let value;
            let answer;
            if (propName == 'properties') {
                Object.values(props).forEach((el) => {
                    this.promptType(propName, res, el);
                });
            }
            else {
                props.forEach((el) => {
                    this.promptType(propName, res, el);
                });
            }
            const template = propName == 'properties' ? { name: '', value: '' } : { value: '' };
            do {
                answer = (0, exports.promptSync)(`Would you like to add additional ${propName}: Y/n? `);
                if (answer.toLowerCase() == 'y') {
                    this.promptType(propName, res, template);
                }
            } while (answer.toLowerCase() == 'y');
            resolve(res);
        });
    }
    unregisterAgent(msg = 'Would you like to unregister this agent?  Y/n ') {
        return new rxjs_1.Observable((observer) => {
            console.log(`\n${msg}`);
            prompt_1.default.get({ name: 'answer', required: true }, (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    _1.utils.isNodeConfigured()
                        .subscribe({
                        next: (res) => {
                            if (res) {
                                let arg = `hzn unregister -frDv`;
                                _1.utils.shell(arg, 'done unregistering agent', 'failed to unregister agent', false)
                                    .subscribe({
                                    next: (res) => observer.complete(),
                                    error: (e) => observer.error(e)
                                });
                            }
                            else {
                                console.log('no need to unregister...');
                                observer.complete();
                            }
                        }, error(e) {
                            observer.complete();
                        }
                    });
                }
                else {
                    observer.complete();
                }
            });
        });
    }
    register(hzn) {
        return new rxjs_1.Observable((observer) => {
            let answer = this.promptRegisterSelection(`Please make a selection: `);
            if (answer == 0) {
                observer.next(0);
                observer.complete();
            }
            else if (answer == 1) {
                console.log('\x1b[32m', '\nRegister with a Policy');
                this.registerWithPolicy(hzn)
                    .subscribe(() => { observer.next(1); observer.complete(); });
            }
            else if (answer == 2) {
                console.log('\x1b[32m', '\nRegister with a Pattern');
                this.registerWithPattern(hzn)
                    .subscribe(() => { observer.next(2); observer.complete(); });
            }
        });
    }
    registerWithPolicy(hzn) {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = hzn.param.name.length > 0 ? `hzn register --policy ${hzn.getPolicyInfo()} --name ${hzn.param.name}` : `hzn register --policy ${hzn.getPolicyInfo()}`;
                    _1.utils.shell(arg, 'done registering agent with policy', 'failed to register agent')
                        .subscribe({
                        complete: () => {
                            observer.next();
                            observer.complete();
                        },
                        error: (err) => observer.error(err)
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    registerWithPattern(hzn) {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = `hzn register --policy ${hzn.nodePolicyJson} --pattern "${hzn.mmsPattern}"`;
                    _1.utils.shell(arg, 'done registering agent', 'failed to register agent')
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
    updatePolicy(param, policy) {
        return this.addPolicy(param, policy, true);
    }
    addPolicy(param, policy, update = false) {
        return new rxjs_1.Observable((observer) => {
            const addOrUpdate = update ? 'update' : 'add';
            let answer = this.promptPolicySelection(`Please select the type of policy you would like to ${addOrUpdate}: `);
            if (answer == 0) {
                observer.next(0);
                observer.complete();
            }
            else if (answer == 1) {
                console.log('\x1b[32m', '\nAdding Service Policy');
                this.addServicePolicy(policy)
                    .subscribe(() => { observer.next(1); observer.complete(); });
            }
            else if (answer == 2) {
                console.log('\x1b[32m', '\nAdding Deployment Policy');
                this.addDeploymentPolicy(policy)
                    .subscribe(() => { observer.next(2); observer.complete(); });
            }
            else if (answer == 3) {
                console.log('\x1b[32m', '\nAdding Node Policy');
                this.addNodePolicy(param, policy)
                    .subscribe(() => { observer.next(3); observer.complete(); });
            }
            else if (answer == 4) {
                console.log('\x1b[32m', '\nAdding Object Policy');
                this.addObjectPolicy(param)
                    .subscribe(() => { observer.next(4); observer.complete(); });
            }
        });
    }
    addDeploymentPolicy(policy) {
        // const arg = `hzn exchange deployment addpolicy -f ${policy.deploymentPolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/policy-${policy.envVar.getEnvValue('MMS_SERVICE_NAME')}_${policy.envVar.getEnvValue('MMS_SERVICE_VERSION')}_${policy.envVar.getEnvValue('ARCH')}`
        const arg = `hzn exchange deployment addpolicy -f ${policy.deploymentPolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/policy-${policy.envVar.getEnvValue('MMS_SERVICE_NAME')}_${policy.envVar.getEnvValue('ARCH')}`;
        return _1.utils.shell(arg);
    }
    addServicePolicy(policy) {
        // const arg = `hzn exchange service addpolicy -f ${policy.servicePolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/${policy.envVar.getEnvValue('SERVICE_NAME')}_${policy.envVar.getEnvValue('SERVICE_VERSION')}_${policy.envVar.getEnvValue('ARCH')}`
        const arg = `hzn exchange service addpolicy -f ${policy.servicePolicyJson} ${policy.envVar.getEnvValue('HZN_ORG_ID')}/${policy.envVar.getEnvValue('SERVICE_NAME')}_${policy.envVar.getEnvValue('ARCH')}`;
        return _1.utils.shell(arg);
    }
    addObjectPolicy(param) {
        let arg = `hzn mms object publish -m ${param.policy.objectPolicyJson} -f ${param.objectFile}`;
        return _1.utils.shell(arg, 'done publishing object', 'failed to publish object', false);
    }
    addObjectPattern(param) {
        // Todo 
    }
    addNodePolicy(param, policy) {
        return new rxjs_1.Observable((observer) => {
            this.unregisterAgent().subscribe({
                complete: () => {
                    let arg = param.name.length > 0 ? `hzn register --policy ${policy.nodePolicyJson} --name ${param.name}` : `hzn register --policy ${policy.nodePolicyJson}`;
                    _1.utils.shell(arg, 'done registering agent with policy', 'failed to register agent')
                        .subscribe({
                        complete: () => {
                            observer.next();
                            observer.complete();
                        },
                        error: (err) => observer.error(err)
                    });
                }, error: (err) => {
                    observer.error(err);
                }
            });
        });
    }
    addRemoteNodePolicy(param, policy) {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn register --policy ${policy.nodePolicyJson} --name ${param.name}`;
            _1.utils.shell(arg, 'done registering remote agent with policy', 'failed to register remote agent')
                .subscribe({
                complete: () => observer.complete(),
                error: (err) => observer.error(err)
            });
        });
    }
    promptRegisterSelection(msg = `Please make a selection: `) {
        let answer;
        console.log('\x1b[36m', `\nType of registrations:\n1) Register with a Policy\n2) Register with a pattern\n0) To exit`);
        do {
            answer = parseInt((0, exports.promptSync)(msg));
            if (answer < 0 || answer > 2) {
                console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.');
            }
        } while (answer < 0 || answer > 4);
        return answer;
    }
    promptPolicySelection(msg = `Please select the type of policy you would like to work with: `) {
        let answer;
        console.log('\x1b[36m', `\nType of policies:\n1) Service Policy\n2) Deployment Policy\n3) Node Policy\n4) Object Policy\n0) To exit`);
        do {
            answer = parseInt((0, exports.promptSync)(msg));
            if (answer < 0 || answer > 4) {
                console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.');
            }
        } while (answer < 0 || answer > 4);
        return answer;
    }
    promptServiceSelection() {
        let answer;
        console.log('\x1b[36m', `\nType of service definitions:\n1) Top Level Service\n2) Dependent Service\n0) To exit`);
        do {
            answer = parseInt((0, exports.promptSync)(`Please make your selection: `));
            if (answer < 0 || answer > 4) {
                console.log('\x1b[41m%s\x1b[0m', '\nInvalid, try again.');
            }
        } while (answer < 0 || answer > 4);
        return answer;
    }
    reviewServiceDefinition() {
        return new rxjs_1.Observable((observer) => {
            let answer = this.promptServiceSelection();
            switch (answer) {
                case 0:
                    observer.next(0);
                    observer.complete();
                    break;
                case 1:
                    console.log('\x1b[32m', '\nReview Top Level Service Definition');
                    this.displayFileContent(`services/top-level-service/service.definition.json`);
                    observer.next(1);
                    observer.complete();
                    break;
                case 2:
                    console.log('\x1b[32m', '\nReview Dependent Service Definition');
                    this.displayFileContent(`services/dependent-service/service.definition.json`);
                    observer.next(2);
                    observer.complete();
                    break;
            }
        });
    }
    reviewPolicy() {
        return new rxjs_1.Observable((observer) => {
            let answer = this.promptPolicySelection();
            switch (answer) {
                case 0:
                    observer.next(0);
                    observer.complete();
                    break;
                case 1:
                    console.log('\x1b[32m', '\nReview Service Policy');
                    this.displayFileContent('service.policy.json');
                    observer.next(1);
                    observer.complete();
                    break;
                case 2:
                    console.log('\x1b[32m', '\nReview Deployment Policy');
                    this.displayFileContent('deployment.policy.json');
                    observer.next(2);
                    observer.complete();
                    break;
                case 3:
                    console.log('\x1b[32m', '\nReview Node Policy');
                    this.displayFileContent('node.policy.json');
                    observer.next(3);
                    observer.complete();
                    break;
                case 4:
                    console.log('\x1b[32m', '\nReview Object Policy');
                    this.displayFileContent('object.policy.json');
                    observer.next(4);
                    observer.complete();
                    break;
            }
        });
    }
    displayFileContent(filename) {
        let policy = this.getJsonFromFile(filename);
        console.dir(policy, { depth: null, colors: true });
    }
    editPolicy() {
        return new rxjs_1.Observable((observer) => {
            let answer = this.promptPolicySelection();
            switch (answer) {
                case 0:
                    observer.next(0);
                    observer.complete();
                    break;
                case 1:
                    console.log('\x1b[32m', '\nWorking with Service Policy');
                    this.editServicePolicy()
                        .subscribe(() => { observer.next(1); observer.complete(); });
                    break;
                case 2:
                    console.log('\x1b[32m', '\nWorking with Deployment Policy');
                    this.editDeploymentPolicy()
                        .subscribe(() => { observer.next(2); observer.complete(); });
                    break;
                case 3:
                    console.log('\x1b[32m', '\nWorking with Node Policy');
                    this.editNodePolicy()
                        .subscribe(() => { observer.next(3); observer.complete(); });
                    break;
                case 4:
                    console.log('\x1b[32m', '\nWorking with Object Policy');
                    this.editObjectPolicy()
                        .subscribe(() => observer.complete());
                    break;
            }
        });
    }
    editObjectPolicy() {
        return this.editTypePolicy('object.policy.json');
    }
    editNodePolicy() {
        return this.editTypePolicy('node.policy.json');
    }
    editDeploymentPolicy() {
        return new rxjs_1.Observable((observer) => {
        });
    }
    editServicePolicy() {
        return this.editTypePolicy('service.policy.json');
    }
    getJsonFromFile(jsonFile) {
        let json;
        console.log(`${this.hznConfig}/${jsonFile}`);
        if ((0, fs_1.existsSync)(`${this.hznConfig}/${jsonFile}`)) {
            try {
                json = jsonfile_1.default.readFileSync(`${this.hznConfig}/${jsonFile}`);
            }
            catch (e) {
                console.log(e);
                json = jsonfile_1.default.readFileSync(`${__dirname}/config/${jsonFile}`);
            }
        }
        else {
            console.log('notfound');
            json = jsonfile_1.default.readFileSync(`${__dirname}/config/${jsonFile}`);
        }
        return json;
    }
    editTypePolicy(filename) {
        return new rxjs_1.Observable((observer) => {
            let policy = this.getJsonFromFile(filename);
            console.dir(policy, { depth: null, colors: true });
            console.log(`\nWould you like to make changes to this policy: Y/n?`);
            prompt_1.default.get({ name: 'answer', required: true }, async (err, question) => {
                if (question.answer.toUpperCase() === 'Y') {
                    let props = this.policyToProps(policy);
                    console.log('\nKey in new value or (leave blank) press Enter to keep current value or enter blank space(s) to omit: ');
                    let keys = Object.keys(props);
                    let res = {};
                    for (const key of keys) {
                        console.log('\x1b[32m', `${key}\n`);
                        // console.dir(`${key} ${props[key]}\n`)
                        res[key] = await this.goPrompt(props[key], key);
                    }
                    console.dir(res, { depth: null, colors: true });
                    console.log(`\nWould you like to save this policy: Y/n?`);
                    prompt_1.default.get({ name: 'answer', required: true }, async (err, question) => {
                        if (question.answer.toUpperCase() === 'Y') {
                            jsonfile_1.default.writeFileSync(`${this.hznConfig}/${filename}`, res, { spaces: 2 });
                        }
                        observer.next();
                        observer.complete();
                    });
                }
                else {
                    observer.next();
                    observer.complete();
                }
            });
        });
    }
    isNodeConfigured() {
        return new rxjs_1.Observable((observer) => {
            let arg = `hzn node list`;
            this.shell(arg, "Successfully list node", "Failed to list node")
                .subscribe({
                next: (res) => {
                    console.log(typeof res == 'string');
                    try {
                        let json = JSON.parse(res);
                        console.log(json.configstate.state);
                        observer.next(json.configstate.state === 'configured');
                        observer.complete();
                    }
                    catch (e) {
                        observer.error(e);
                    }
                }, error(e) {
                    observer.error(e);
                }
            });
        });
    }
    shell(arg, success = 'command executed successfully', error = 'command failed', prnStdout = true, options = { maxBuffer: 1024 * 2000 }) {
        return new rxjs_1.Observable((observer) => {
            console.log(arg);
            let child = exec(arg, options, (err, stdout, stderr) => {
                if (!err) {
                    // console.log(stdout);
                    console.log(success);
                    observer.next(prnStdout ? stdout : '');
                    observer.complete();
                }
                else {
                    console.log(`${error}: ${err}`);
                    observer.error(err);
                }
            });
            child.stdout.pipe(process.stdout);
            child.stdout.on('data', (data) => {
                if (data.indexOf(`Run 'hzn agreement list' to view`) > 0) {
                    console.log(success);
                    observer.next(prnStdout ? data : '');
                    observer.complete();
                }
            });
            child.on('data', (data) => {
                console.log(data);
            });
        });
    }
    shell2(arg, success = 'command executed successfully', error = 'command failed', prnStdout = true, options = { maxBuffer: 1024 * 2000 }) {
        return new rxjs_1.Observable((observer) => {
            console.log(arg);
            let output = '';
            let child = exec(arg, options, (err, stdout, stderr) => {
                if (!err) {
                    // console.log(stdout);
                    console.log(success);
                    observer.next(prnStdout ? stdout : '');
                    observer.complete();
                }
                else {
                    console.log(`${error}: ${err}`);
                    observer.error(err);
                }
            });
            child.stdout.pipe(process.stdout);
            // child.on('data', (data) => {
            //   console.log('$$$$###@@@@', data)
            //   if(data.indexOf('done registering agent with policy') >= 0 || data.indexOf('Horizon node is registered. Workload services should begin executing shortly.') >= 0) {
            //     observer.next('');
            //     observer.complete();
            //   }
            //   console.log('$$$$###@@@@')
            // })
            child.on('exit', (code) => {
                console.log('child process exited with code ' + code.toString());
                observer.next(prnStdout ? output : '');
                observer.complete();
            });
            child.stdout.on('data', (data) => {
                output += data;
            });
            child.stderr.on('data', (data) => {
                console.log('stderr: ' + data.toString());
            });
        });
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map