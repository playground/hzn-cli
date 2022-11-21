import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { existsSync } from 'fs';

import { Hzn, utils } from '../common/src/hzn';
import { customRun, IHznParam, justRun, loop, promptForUpdate, runDirectly } from '../common/src/interface';
import { IAutoParam } from '../common/src/interface/hzn-model';

import type { Arguments, CommandBuilder } from 'yargs';
type Options = {
  action: string;
  org: string | undefined;
  config_path: string | undefined;
  name: string | undefined;
  object_type: string | undefined;
  object_id: string | undefined;
  object: string | undefined;
  pattern: string | undefined;
  watch: string | undefined;
  filter: string | undefined;
  skip_config_update: string | undefined;
  config_file: string | undefined;
};
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

let availableActions = 'Available actions:'
runDirectly.concat(justRun).concat(promptForUpdate).concat(customRun).sort().forEach((action) => {
  availableActions += ` ${action}`
}) 
export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: {type: 'string', desc: 'Organization to be deployed to'},
      config_path: {type: 'string', desc: 'Specify path to your configuration, default is ./config'},
      name: {type: 'string', desc: 'Name of service, pattern, policy & etc.'},
      object_type: {type: 'string', desc: 'Type of object'},
      object_id: {type: 'string', desc: 'Id of object to be published'},
      object: {type: 'string', desc: 'Object file to be published'},
      pattern: {type: 'string', desc: 'Pattern name'},
      watch: {type: 'string', desc: 'watch = true/false'},
      filter: {type: 'string', desc: 'filter search result = arm, amd64, arm64 & etc'},
      skip_config_update: {type: 'string', desc: 'Do not prompt for config updates = true/false'},
      config_file: {type: 'string', desc: 'Provide config json file for auto setup'}
    })
    .positional('action', {
      type: 'string', 
      demandOption: true,
      desc: availableActions
    });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const { action, org, config_path, name, object_type, object_id, object, pattern, watch, filter, skip_config_update, config_file } = argv;
  let env = org || '';
  const n = name || '';
  const objType = object_type || '';
  const objId = object_id || '';
  const obj = object || '';
  const p = pattern || '';
  const configPath = config_path || utils.getHznConfig();
  const skipInitialize = ['dockerImageExists'];

  if(env.length == 0) {
    let value = utils.getPropValueFromFile(`${utils.getHznConfig()}/.env-local`, 'DEFAULT_ORG')
    env = value.length > 0 ? value : 'biz'
  }
  const proceed = () => {
    if(existsSync(`${utils.getHznConfig()}/.env-hzn.json`) && existsSync(`${utils.getHznConfig()}/.env-local`)) {
      const hznModel = {
        org: env, 
        configPath: configPath, 
        name: name || '',
        mmsPattern: p, 
        objectType: object_type || '', 
        objectId: object_id || '', 
        objectFile: object || '',
        action: action,
        watch: watch && watch === 'true' ? 'watch ' : '',
        filter: filter,
        configFile: config_file || ''
      } as IHznParam;
      const hzn = new Hzn(hznModel);

      hzn.init()
      .subscribe({
        complete: () => {
          if(loop.includes(action)) {
            let processing = false
            setInterval(() => {
              if(!processing) {
                processing = true
                hzn[action]()
                .subscribe({
                  next: (answer: number) => {
                    if(answer == 0) {
                      console.log('process completed.');
                      process.exit(0)                    
                    } else {
                      processing = false
                    }
                  }
                })      
              }
            }, 1000)
          } else {
            hzn[action]()
            .subscribe({
              next: (msg: string) => console.log(msg),
              complete: () => {
                console.log('process completed.');
                process.exit(0)          
              }
            })  
          }
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

  if(action && skipInitialize.concat(runDirectly).concat(justRun).concat(promptForUpdate).concat(customRun).includes(action)) {
    if(runDirectly.indexOf(action) >= 0) {
      console.log(action, env);
      utils[action]()
      .subscribe({
        complete: () => process.exit(0),
        error: (err) => {
          console.log(err);      
          process.exit(0);  
        }
      })
    } else if(customRun.indexOf(action) >= 0) {
      console.log(action);
      const params: IAutoParam = {configFile: config_file, object: obj}
      utils[action](params)
      .subscribe({
        next: (msg) => console.log(msg),
        complete: () => process.exit(0),
        error: (err) => {
          console.log(err);      
          process.exit(0);  
        }
      })
    } else {
      console.log(action, env);
      utils.checkDefaultConfig()
      .subscribe({
        complete: () => {
          if(skipInitialize.indexOf(action) >= 0) {
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
              next: (data: any) => {
                env = data.env ? data.env : env
                proceed()
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
    }  
  } else {
    console.log('specify an action you would like to perform, ex: "oh deploy test" or "oh deploy -h" for help')
  } 
};

