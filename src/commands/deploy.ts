import type { Arguments, CommandBuilder } from 'yargs';
import { Hzn } from '../common/src/hzn';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { existsSync } from 'fs';

type Options = {
  action: string;
  org: string | undefined;
  configpath: string | undefined;
  name: string | undefined;
};
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: {type: 'string', desc: 'Organization to be deployed to'},
      configpath: {type: 'string', desc: 'Specify path to your configuration, default is ./config'},
      name: {type: 'string', desc: 'Name of service, pattern, policy & etc.'}
    })
    .positional('action', {
      type: 'string', 
      demandOption: true,
      desc: 'Available actions:  test, buildServiceImage, pushServiceImage, publishService, publishPatterrn, buildMMSImage, pushMMSImage, publishMMSService, ' +
            'publishMMSPattern, agentRun, publishMMSObject, unregisterAgent, registerAgent, showHznInfo, updateHznInfo, listService, listPattern, ' +
            'listNode, listObject, listDeploymentPolicy, listNodePattern, checkConfigState, getDeviceArch, createHznKey'
    });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const { action, org, configpath, name } = argv;
  const env = org || 'biz';
  const n = name || '';
  console.log('$$$ ', action, env, configpath, n);
  const configPath = configpath || 'config';
  if(existsSync(`${configPath}/.env-hzn.json`)) {
    const hzn = new Hzn(env, configPath, n);

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

