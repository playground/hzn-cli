import { Observable, of } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;

const env = process.env.npm_config_env || 'biz';

export class Utils {
  constructor() {}
  init() {
  }
  listService() {
    let name = process.env.npm_config_name;
    name = name ? `hzn exchange service list ${name}` : 'hzn exchange service list';
    return this.shell(name);
  }
  listPattern() {
    let name = process.env.npm_config_name;
    name = name ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
    return this.shell(name);
  }
  listNode() {
    let name = process.env.npm_config_name;
    name = name ? `hzn exchange node list ${name}` : 'hzn exchange node list';
    return this.shell(name);
  }
  listObject() {
    let name = process.env.npm_config_name;
    name = name ? `hzn mms object list ${name}` : 'hzn mms object list';
    return this.shell(name);
  }
  listDeploymentPolicy() {
    let name = process.env.npm_config_name;
    name = name ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
    return this.shell(name);
  }
  createHznKey(org: string, id: string) {
    if(org && id) {
      return this.shell(`hzn key create ${org} ${id}`);  
    } else {
      console.log('please provide both <YOUR_DOCKERHUB_ID> and <HZN_ORG_ID> in .env-hzn.json')
      return of();
    }
  }
  checkConfigState() {
    return this.shell(`hzn node list | jq .configstate.state`);  
  }
  listNodePattern() {
    return this.shell(`hzn node list | jq .pattern`);  
  }
  getDeviceArch() {
    return this.shell(`hzn architecture`);  
  }
  aptUpate() {
    // TODO, if failed run sudo apt-get -y --fix-missing full-upgrade
    // cat info.cfg
    return this.shell(`sudo apt-get -y update`);
  }
  installPrereq() {
    return this.shell(`sudo apt-get -yq install jq curl git`);
  }
  installHznCli() {
    return this.shell(`curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/api/v1/objects/IBM/agent_files/agent-install.sh/data && chmod +x agent-install.sh && sudo -s -E ./agent-install.sh -i 'css:'`)
  }
  shell(arg: string) {
    return new Observable((observer) => {
      exec(arg, {maxBuffer: 1024 * 2000}, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout);
          observer.next(stdout);
          observer.complete();
        } else {
          console.log(`shell command failed: ${err}`);
          observer.error(err);
        }
      });  
    });
  }
}
