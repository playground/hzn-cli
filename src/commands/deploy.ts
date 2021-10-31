import type { Arguments, CommandBuilder } from 'yargs';
import { Hzn } from '../common/src/hzn';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { existsSync } from 'fs';

type Options = {
  action: string;
  org: string | undefined;
  config_path: string | undefined;
  name: string | undefined;
  object_type: string | undefined;
  object_id: string | undefined;
  object: string | undefined;
  pattern: string | undefined;
};
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: {type: 'string', desc: 'Organization to be deployed to'},
      config_path: {type: 'string', desc: 'Specify path to your configuration, default is ./config'},
      name: {type: 'string', desc: 'Name of service, pattern, policy & etc.'},
      object_type: {type: 'string', desc: 'Type of object'},
      object_id: {type: 'string', desc: 'Id of object to be published'},
      object: {type: 'string', desc: 'Object file to be published'},
      pattern: {type: 'string', desc: 'MMS pattern'}
    })
    .positional('action', {
      type: 'string', 
      demandOption: true,
      desc: 'Available actions:  test, buildServiceImage, pushServiceImage, publishService, publishPatterrn, buildMMSImage, pushMMSImage, publishMMSService, ' +
            'publishMMSPattern, agentRun, publishMMSObject, unregisterAgent, registerAgent, showHznInfo, updateHznInfo, listService, listPattern, ' +
            'listNode, listObject, listDeploymentPolicy, listNodePattern, checkConfigState, getDeviceArch, createHznKey, uninstallHorizon'
    });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const { action, org, config_path, name, object_type, object_id, object, pattern } = argv;
  const env = org || 'biz';
  const n = name || '';
  const objType = object_type || '';
  const objId = object_id || '';
  const obj = object || '';
  const p = pattern || '';
  console.log('$$$ ', action, env, config_path, n);
  const configPath = config_path || 'config';
  if(existsSync(`${configPath}/.env-hzn.json`)) {
    const hzn = new Hzn(env, configPath, n, objType, objId, obj, p);

    hzn.setup()
    .subscribe({
      complete: () => {
        hzn[action]()
        .subscribe({
          complete:() => {
            console.log('process completed.');
            process.exit(0)          
          }
        })
      },
      error: (err) => {
        console.log('something went wrong. ', err);      
        process.exit(0);
      }
    })  
  } else {
    console.log('./config/.env-hzn.json file not fouund.')
  }
};

