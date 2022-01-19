import type { Arguments, CommandBuilder } from 'yargs';
import { Hzn, utils } from '../common/src/hzn';
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
  skip_config_update: string | undefined;
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
      pattern: {type: 'string', desc: 'MMS pattern'},
      skip_config_update: {type: 'string', desc: 'Do not prompt for config updates'}
    })
    .positional('action', {
      type: 'string', 
      demandOption: true,
      desc: 'Available actions: ' +
            'allInOneMMS, buildAndPublish, buildMMSImage, buildServiceImage, checkConfigState, createHznKey, dockerImageExists, getDeviceArch, ' +
            'getIpAddress, listDeploymentPolicy, listNode, listNodePattern, listObject, listPattern, listService, publishMMSObject, ' +
            'publishMMSPattern, publishMMSService, publishPatterrn, publishService, pullDockerImage, pushMMSImage, pushServiceImage, ' +
		        'registerAgent, removeOrg, setup, setupManagementHub, showHznInfo, test, uninstallHorizon, unregisterAgent, updateHznInfo'
    });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const { action, org, config_path, name, object_type, object_id, object, pattern, skip_config_update } = argv;
  let env = org || '';
  const n = name || '';
  const objType = object_type || '';
  const objId = object_id || '';
  const obj = object || '';
  const p = pattern || '';
  const configPath = config_path || utils.getHznConfig();
  const skipInitialize = ['buildMMSImage', 'buildServiceImage', 'dockerImageExists'];
  const justRun = ['checkConfigState', 'createHznKey', 'getDeviceArch', 'listDeploymentPolicy', 'listNode', 'listNodePattern', 'listObject', 'listPattern', 'listService', 'removeOrg', 'showHznInfo', 'uninstallHorizon', 'updateHznInfo'];
  const promptForUpdate = ['setup', 'test', 'buildAndPublish', 'publishService', 'publishPatterrn', 'publishMMSService', 'publishMMSPattern', 'registerAgent', 'publishMMSObject', 'unregisterAgent']
  const runDirectly = ['setupManagementHub', 'uninstallHorizon'];

  if(env.length == 0) {
    let value = utils.getPropValueFromFile(`${utils.getHznConfig()}/.env-local`, 'DEFAULT_ORG')
    env = value.length > 0 ? value : 'biz'
  }
  const proceed = () => {
    if(existsSync(`${utils.getHznConfig()}/.env-hzn.json`)) {
      const hzn = new Hzn(env, configPath, n, objType, objId, obj, p);
  
      hzn.init()
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
          console.log(err);      
          process.exit(0);
        }
      })  
    } else {
      console.log(`${configPath}/.env-hzn.json file not fouund.`)
    }  
  }

  if(action) {
    console.log('$$$ ', action, env);
    utils.checkDefaultConfig()
    .subscribe({
      complete: () => {
        if(runDirectly.indexOf(action) >= 0) {
          utils[action]()
          .subscribe({
            complete: () => process.exit(0),
            error: (err) => {
              console.log(err);      
              process.exit(0);  
            }
          })
        } else if(skipInitialize.indexOf(action) >= 0) {
          proceed();
        } else if(justRun.indexOf(action) >= 0) {
          utils.orgCheck(env, true)
          .subscribe({
            complete: () => proceed(),
            error: (err) => {
              console.log(err);      
              process.exit(0);  
            }
          })
        } else if(promptForUpdate.indexOf(action) < 0 || skip_config_update) {
          utils.orgCheck(env, skip_config_update === 'true')
          .subscribe({
            complete: () => proceed(),
            error: (err) => {
              console.log(err);      
              process.exit(0);  
            }
          })
        } else {
          utils.updateEnvFiles(env)
          .subscribe({
            complete: () => {
              proceed()
            }, error: (err) => {
              console.log(err)
              process.exit(0);  
            }  
          })  
        }
      }, error: (err) => {
        if(skipInitialize.indexOf(action) < 0) {
          console.log(err, 'Initialising...')
          utils.setupEnvFiles(env)
          .subscribe({
            complete: () => {
              proceed();
            }, error: () => process.exit(0)
          })
        } else {
          utils.uninstallHorizon()
          .subscribe({
            complete:() => {
              console.log('process completed.');
              process.exit(0)          
            }
          })
        }
      }
    })
  } else {
    console.log('specify an action you would like to perform, ex: "oh deploy test" or "oh deploy -h" for help')
  } 
};

