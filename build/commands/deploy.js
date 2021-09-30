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
    pattern: { type: 'string', desc: 'MMS pattern' }
})
    .positional('action', {
    type: 'string',
    demandOption: true,
    desc: 'Available actions:  test, buildServiceImage, pushServiceImage, publishService, publishPatterrn, buildMMSImage, pushMMSImage, publishMMSService, ' +
        'publishMMSPattern, agentRun, publishMMSObject, unregisterAgent, registerAgent, showHznInfo, updateHznInfo, listService, listPattern, ' +
        'listNode, listObject, listDeploymentPolicy, listNodePattern, checkConfigState, getDeviceArch, createHznKey'
});
exports.builder = builder;
const handler = (argv) => {
    (0, clear_1.default)();
    console.log(chalk_1.default.greenBright(figlet_1.default.textSync('hzn-cli', { horizontalLayout: 'full' })));
    const { action, org, config_path, name, object_type, object_id, object, pattern } = argv;
    const env = org || 'biz';
    const n = name || '';
    const objType = object_type || '';
    const objId = object_id || '';
    const obj = object || '';
    const p = pattern || '';
    console.log('$$$ ', action, env, config_path, n);
    const configPath = config_path || 'config';
    if ((0, fs_1.existsSync)(`${configPath}/.env-hzn.json`)) {
        const hzn = new hzn_1.Hzn(env, configPath, n, objType, objId, obj, p);
        hzn.setup()
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
                console.log('something went wrong. ', err);
                process.exit(0);
            }
        });
    }
    else {
        console.log('./config/.env-hzn.json file not fouund.');
    }
};
exports.handler = handler;
//# sourceMappingURL=deploy.js.map