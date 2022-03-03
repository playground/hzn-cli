"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const hzn_1 = require("../common/src/hzn");
const chalk_1 = __importDefault(require("chalk"));
const clear_1 = __importDefault(require("clear"));
const figlet_1 = __importDefault(require("figlet"));
const fs_1 = require("fs");
exports.command = 'deploy <action>';
exports.desc = 'Deploy <action> to Org <org>';
const builder = (yargs) => yargs
    .options({
    org: { type: 'string', desc: 'Organization to be deployed to' },
    config_path: { type: 'string', desc: 'Specify path to your configuration, default is ./config' },
    name: { type: 'string', desc: 'Name of service, pattern, policy & etc.' },
    object_type: { type: 'string', desc: 'Type of object' },
    object_id: { type: 'string', desc: 'Id of object to be published' },
    object: { type: 'string', desc: 'Object file to be published' },
    pattern: { type: 'string', desc: 'Pattern name' },
    skip_config_update: { type: 'string', desc: 'Do not prompt for config updates' }
})
    .positional('action', {
    type: 'string',
    demandOption: true,
    desc: 'Available actions: ' +
        'addDeploymentPolicy, addNodePolicy, addServicePolicy, appendSupport, buildAndPublish, buildMMSImage, buildPublishAndRegister, ' +
        'buildServiceImage, checkConfigState, createHznKey, dockerImageExists, editPolicy, editDeploymentPolicy, editNodePolicy, editServicePolicy, getDeviceArch, ' +
        'getIpAddress, isConfigured, listDeploymentPolicy, listNode, listNodePattern, listObject, listPattern, listService, publishAndRegister, publishMMSObject, ' +
        'publishMMSPattern, publishMMSService, publishPatterrn, publishService, publishServiceAndPattern, pullDockerImage, pushMMSImage, pushServiceImage, ' +
        'registerAgent, removeOrg, setup, setupManagementHub, showHznInfo, test, uninstallHorizon, unregisterAgent, updateHznInfo'
});
exports.builder = builder;
const handler = (argv) => {
    (0, clear_1.default)();
    console.log(chalk_1.default.greenBright(figlet_1.default.textSync('hzn-cli', { horizontalLayout: 'full' })));
    const { action, org, config_path, name, object_type, object_id, object, pattern, skip_config_update } = argv;
    let env = org || '';
    const n = name || '';
    const objType = object_type || '';
    const objId = object_id || '';
    const obj = object || '';
    const p = pattern || '';
    const configPath = config_path || hzn_1.utils.getHznConfig();
    const skipInitialize = ['dockerImageExists'];
    const justRun = [
        'appendSupport', 'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'listDeploymentPolicy', 'listNode', 'listNodePattern',
        'listObject', 'listPattern', 'listService', 'removeOrg', 'showHznInfo', 'uninstallHorizon', 'updateHznInfo'
    ];
    const promptForUpdate = [
        'setup', 'test', 'addDeploymentPolicy', 'addNodePolicy', 'addServicePolicy', 'buildAndPublish', 'buildPublishAndRegister',
        'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister',
        'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService',
        'publishMMSPattern', 'publishMMSObject', 'pushMMSImage', 'pushServiceImage', 'registerAgent', 'unregisterAgent'
    ];
    const runDirectly = ['setupManagementHub', 'uninstallHorizon'];
    if (env.length == 0) {
        let value = hzn_1.utils.getPropValueFromFile(`${hzn_1.utils.getHznConfig()}/.env-local`, 'DEFAULT_ORG');
        env = value.length > 0 ? value : 'biz';
    }
    const proceed = () => {
        if ((0, fs_1.existsSync)(`${hzn_1.utils.getHznConfig()}/.env-hzn.json`) && (0, fs_1.existsSync)(`${hzn_1.utils.getHznConfig()}/.env-local`)) {
            const hzn = new hzn_1.Hzn(env, configPath, n, objType, objId, obj, p);
            hzn.init()
                .subscribe({
                complete: () => {
                    hzn[action]()
                        .subscribe({
                        complete: () => {
                            console.log('process completed.');
                            process.exit(0);
                        }
                    });
                },
                error: (err) => {
                    console.log(err);
                    process.exit(0);
                }
            });
        }
        else {
            console.log(`${configPath}/.env-hzn.json file not fouund.`);
        }
    };
    if (action && skipInitialize.concat(runDirectly).concat(justRun).concat(promptForUpdate).includes(action)) {
        console.log('$$$ ', action, env);
        if (runDirectly.indexOf(action) >= 0) {
            hzn_1.utils[action]()
                .subscribe({
                complete: () => process.exit(0),
                error: (err) => {
                    console.log(err);
                    process.exit(0);
                }
            });
        }
        else {
            hzn_1.utils.checkDefaultConfig()
                .subscribe({
                complete: () => {
                    if (skipInitialize.indexOf(action) >= 0) {
                        proceed();
                    }
                    else if (justRun.indexOf(action) >= 0) {
                        hzn_1.utils.orgCheck(env, true)
                            .subscribe({
                            complete: () => proceed(),
                            error: (err) => {
                                console.log(err);
                                process.exit(0);
                            }
                        });
                    }
                    else if (promptForUpdate.indexOf(action) < 0 || skip_config_update) {
                        hzn_1.utils.orgCheck(env, skip_config_update === 'true')
                            .subscribe({
                            complete: () => proceed(),
                            error: (err) => {
                                console.log(err);
                                process.exit(0);
                            }
                        });
                    }
                    else {
                        hzn_1.utils.updateEnvFiles(env)
                            .subscribe({
                            complete: () => {
                                proceed();
                            }, error: (err) => {
                                console.log(err);
                                process.exit(0);
                            }
                        });
                    }
                }, error: (err) => {
                    if (skipInitialize.indexOf(action) < 0) {
                        console.log(err, 'Initialising...');
                        hzn_1.utils.setupEnvFiles(env)
                            .subscribe({
                            next: (data) => {
                                env = data.env ? data.env : env;
                                proceed();
                            }, error: () => process.exit(0)
                        });
                    }
                    else {
                        hzn_1.utils.uninstallHorizon()
                            .subscribe({
                            complete: () => {
                                console.log('process completed.');
                                process.exit(0);
                            }
                        });
                    }
                }
            });
        }
    }
    else {
        console.log('specify an action you would like to perform, ex: "oh deploy test" or "oh deploy -h" for help');
    }
};
exports.handler = handler;
//# sourceMappingURL=deploy.js.map