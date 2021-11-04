import { Observable, of } from 'rxjs';
const cp = require('child_process'),
exec = cp.exec;

const env = process.env.npm_config_env || 'biz';

export class Utils {
  constructor() {}
  init() {
  }
  listService(name: string) {
    const arg = name.length > 0 ? `hzn exchange service list ${name}` : 'hzn exchange service list';
    return this.shell(arg);
  }
  listPattern(name: string) {
    const arg = name.length > 0 ? `hzn exchange pattern list ${name}` : 'hzn exchange pattern list';
    return this.shell(arg);
  }
  listNode(name: string) {
    const arg = name.length > 0 ? `hzn exchange node list ${name}` : 'hzn exchange node list';
    return this.shell(arg);
  }
  listObject(name: string) {
    const arg = name.length > 0 ? `hzn mms object list ${name}` : 'hzn mms object list';
    return this.shell(arg);
  }
  listDeploymentPolicy(name: string) {
    const arg = name.length > 0 ? `hzn exchange deployment listpolicy ${name}` : 'hzn exchange deployment listpolicy';
    return this.shell(arg);
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
  checkOS() {
    return this.shell(`cat /etc/os-release`);  
  }
  aptUpdate() {
    // TODO, if failed run sudo apt-get -y --fix-missing full-upgrade
    // cat info.cfg
    return this.shell(`sudo apt-get -y update && sudo apt-get -yq install jq curl git`);
  }
  installPrereq() {
    return new Observable((observer) => {
      this.aptUpdate()
      .subscribe({
        complete: () => observer.complete(),
        error: () => observer.complete() // Ignore errors
      })
    });
  }
  installHznCli(anax: string, id: null) {
    if(anax && anax.length > 0) {
      return this.shell(`curl -sSL ${anax} | sudo -s -E bash -s -- -i anax: -k css: -c css: -p IBM/pattern-ibm.helloworld -w '*' -T 120`)
    } else {
      let nodeId = id ? ` -d ${id}` : '';
      return this.shell(`curl -u "$HZN_ORG_ID/$HZN_EXCHANGE_USER_AUTH" -k -o agent-install.sh $HZN_FSS_CSSURL/api/v1/objects/IBM/agent_files/agent-install.sh/data && chmod +x agent-install.sh && sudo -s -E ./agent-install.sh -i 'css:' ${nodeId}`)
    }  
  }
  uninstallHorizon() {
    return this.shell(`sudo apt purge -y bluehorizon horizon horizon-cli`);
  }
  shell(arg: string, options={maxBuffer: 1024 * 2000}) {
    return new Observable((observer) => {
      console.log(arg);
      let child = exec(arg, options, (err: any, stdout: any, stderr: any) => {
        if(!err) {
          console.log(stdout);
          observer.next(stdout);
          observer.complete();
        } else {
          console.log(`shell command failed: ${err}`);
          observer.error(err);
        }
      });
      child.stdout.pipe(process.stdout);
      child.on('data', (data) => {
        console.log(data)
      })  
    });
  }
}
