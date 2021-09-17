import type { Arguments, CommandBuilder } from 'yargs';
import { Hzn } from '../common/src/hzn';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';

type Options = {
  action: string;
  org: string | undefined;
};
export const command: string = 'deploy <action>';
export const desc: string = 'Deploy <action> to Org <org>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      org: { type: 'string' },
    })
    .positional('action', { type: 'string', demandOption: true });

export const handler = (argv: Arguments<Options>): void => {
  clear();
  console.log(
    chalk.greenBright(
      figlet.textSync('hzn-cli', { horizontalLayout: 'full' })
    )
  );
  const hzn = new Hzn();
  const { action, org } = argv;
  hzn.setup()
  .subscribe({
    complete: () => {
      hzn[action]()
      .subscribe({
        complete:() => {
          console.log(action, process.env.YOUR_SERVICE_NAME, process.env.HZN_ORG_ID);
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
};