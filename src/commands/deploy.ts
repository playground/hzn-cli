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
};
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: { type: 'string', desc: 'Organization to be deployed to'},
      configpath: {type: 'string', desc: 'Specify path to your configuration, default is ./config'}
    })
    .positional('action', { type: 'string', demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const { action, org, configpath } = argv;
  const env = org || 'biz';
  console.log('$$$ ', action, env, configpath);
  const configPath = configpath || 'config';
  if(existsSync(`${configPath}/.env-hzn.json`)) {
    const hzn = new Hzn(env, configPath);

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

