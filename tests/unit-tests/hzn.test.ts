import { mocked } from 'ts-jest/utils'
import { Hzn } from '../../src/common/src/hzn';
import { Utils } from '../../src/common/src/utils';
import { Env } from '../../src/common/src/env';
import { IHznParam, justRun, runDirectly, promptForUpdate } from '../../src/common/src/interface'

console.log(process.cwd(), __dirname)
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
  it('object A should equal to object B but not C', () => {
    let A = {test1: 'test1', test2: 'test2', test3: 'test3'}
    let B = {test1: 'test1', test2: 'test2', test3: 'test3'}
    let C = {test1: 'test1', test2: 'test2', test5: 'test5'}
    expect(instance.utils.shallowEqual(A, B)).toBeTruthy()
    expect(instance.utils.shallowEqual(A, C)).toBeFalsy()
  })
})