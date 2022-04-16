"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const hzn_1 = require("../common/src/hzn");
const interface_1 = require("../common/src/interface");
const chalk_1 = __importDefault(require("chalk"));
const clear_1 = __importDefault(require("clear"));
const figlet_1 = __importDefault(require("figlet"));
const fs_1 = require("fs");
exports.command = 'deploy <action>';
exports.desc = 'Deploy <action> to Org <org>';
let availableActions = 'Available actions:';
interface_1.runDirectly.concat(interface_1.justRun).concat(interface_1.promptForUpdate).sort().forEach((action) => {
    availableActions += ` ${action}`;
});
const builder = (yargs) => yargs
    .options({
    org: { type: 'string', desc: 'Organization to be deployed to' },
    config_path: { type: 'string', desc: 'Specify path to your configuration, default is ./config' },
    name: { type: 'string', desc: 'Name of service, pattern, policy & etc.' },
    object_type: { type: 'string', desc: 'Type of object' },
    object_id: { type: 'string', desc: 'Id of object to be published' },
    object: { type: 'string', desc: 'Object file to be published' },
    pattern: { type: 'string', desc: 'Pattern name' },
    watch: { type: 'string', desc: 'watch = true/false' },
    filter: { type: 'string', desc: 'filter search result = arm, amd64, arm64 & etc' },
    skip_config_update: { type: 'string', desc: 'Do not prompt for config updates = true/false' }
})
    .positional('action', {
    type: 'string',
    demandOption: true,
    desc: availableActions
});
exports.builder = builder;
const handler = (argv) => {
    (0, clear_1.default)();
    console.log(chalk_1.default.greenBright(figlet_1.default.textSync('hzn-cli', { horizontalLayout: 'full' })));
    const { action, org, config_path, name, object_type, object_id, object, pattern, watch, filter, skip_config_update } = argv;
    let env = org || '';
    const n = name || '';
    const objType = object_type || '';
    const objId = object_id || '';
    const obj = object || '';
    const p = pattern || '';
    const configPath = config_path || hzn_1.utils.getHznConfig();
    const skipInitialize = ['dockerImageExists'];
    if (env.length == 0) {
        let value = hzn_1.utils.getPropValueFromFile(`${hzn_1.utils.getHznConfig()}/.env-local`, 'DEFAULT_ORG');
        env = value.length > 0 ? value : 'biz';
    }
    const proceed = () => {
        if ((0, fs_1.existsSync)(`${hzn_1.utils.getHznConfig()}/.env-hzn.json`) && (0, fs_1.existsSync)(`${hzn_1.utils.getHznConfig()}/.env-local`)) {
            const hznModel = {
                org: env,
                configPath: configPath,
                name: name || '',
                objectType: object_type || '',
                objectId: object_id || '',
                objectFile: object || '',
                action: action,
                watch: watch && watch === 'true' ? 'watch ' : '',
                filter: filter
            };
            const hzn = new hzn_1.Hzn(hznModel);
            hzn.init()
                .subscribe({
                complete: () => {
                    if (interface_1.loop.includes(action)) {
                        let processing = false;
                        setInterval(() => {
                            if (!processing) {
                                processing = true;
                                hzn[action]()
                                    .subscribe({
                                    next: (answer) => {
                                        if (answer == 0) {
                                            console.log('process completed.');
                                            process.exit(0);
                                        }
                                        else {
                                            processing = false;
                                        }
                                    }
                                });
                            }
                        }, 1000);
                    }
                    else {
                        hzn[action]()
                            .subscribe({
                            next: (msg) => console.log(msg),
                            complete: () => {
                                console.log('process completed.');
                                process.exit(0);
                            }
                        });
                    }
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
    if (action && skipInitialize.concat(interface_1.runDirectly).concat(interface_1.justRun).concat(interface_1.promptForUpdate).includes(action)) {
        console.log(action, env);
        if (interface_1.runDirectly.indexOf(action) >= 0) {
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
                    else if (interface_1.justRun.indexOf(action) >= 0) {
                        hzn_1.utils.orgCheck(env, true)
                            .subscribe({
                            complete: () => proceed(),
                            error: (err) => {
                                console.log(err);
                                process.exit(0);
                            }
                        });
                    }
                    else if (interface_1.promptForUpdate.indexOf(action) < 0 || skip_config_update) {
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