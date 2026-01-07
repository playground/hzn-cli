import { Hzn } from '../../src/common/src/hzn';
import { Utils } from '../../src/common/src/utils';
import { Env } from '../../src/common/src/env';
import { IHznParam, justRun, runDirectly, promptForUpdate } from '../../src/common/src/interface';
import { } from '../helpers/mock';

describe('Hzn', () => {
  let instance: Hzn;
  let param: IHznParam = {
    org: 'myorg',
    configPath: 'configPath',
    name: 'name',
    objectType: 'objectType',
    objectId: 'objectId',
    objectFile: 'objectFile',
    mmsPattern: 'mmsPattern',
    action: 'action',
    watch: 'true',
    filter: '',
    policy: {
      envVar: '',
      nodePolicyJson: '',
      servicePolicyJson: '',
      objectPolicyJson: '',
      deploymentPolicyJson: '',
      topLevelDeploymentPolicyJson: ''
    },
    configFile: '',
    image: '',
    port: '',
    type: '',
    k8s: '',
    compatibility: ''
  }

  beforeEach(() => {
    instance = new Hzn(param)
  })
  it('should have instance of Hzn, Utils & Env', () => {
    expect(instance).toBeInstanceOf(Hzn)
    expect(instance.utils).toBeInstanceOf(Utils)
    expect(instance.envVar).toBeInstanceOf(Env)
    // expect(Utils).toHaveBeenCalledTimes(0)
  })

})