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
    org: { type: 'string' },
})
    .positional('action', { type: 'string', demandOption: true });
exports.builder = builder;
const handler = (argv) => {
    (0, clear_1.default)();
    console.log(chalk_1.default.greenBright(figlet_1.default.textSync('hzn-cli', { horizontalLayout: 'full' })));
    if ((0, fs_1.existsSync)('./config/.env-hzn.json')) {
        const hzn = new hzn_1.Hzn();
        const { action, org } = argv;
        console.log('$$$ ', action, org);
        process.env.npm_config_env = org;
        hzn.setup()
            .subscribe({
            complete: () => {
                hzn[action]()
                    .subscribe({
                    complete: () => {
                        console.log(action, process.env.YOUR_SERVICE_NAME, process.env.HZN_ORG_ID);
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