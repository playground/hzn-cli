export const justRun = [
  'appendSupport', 'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'listAgreement', 
  'listDeploymentPolicy', 'listNode', 'listNodePattern', 'listObject', 'listPattern', 'listService', 'removeOrg',
  'removeNode'
];
export const promptForUpdate = [
  'setup', 'test', 'addDeploymentPolicy', 'addNodePolicy', 'addServicePolicy', 'addPolicy', 'buildAndPublish', 'buildPublishAndRegister', 
  'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister', 
  'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService', 
  'publishMMSPattern', 'publishMMSObject', 'publishMMSObjectPolicy', 'pushMMSImage', 'pushServiceImage', 'registerAgent', 'unregisterAgent'
];
export const runDirectly = ['deleteObject', 'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon'];

export interface IHznParam {
  org: string;
  configPath: string;
  name: string;
  objectType: string;
  objectId: string;
  objectFile: string;
  mmsPattern: string;
  action: string;
  watch: string;
}
export class RequiredService {
  org = '$HZN_ORG_ID';
  url = '$SERVICE_NAME';
  version = '$SERVICE_VERSION_RANGE_UPPER';
  versionRange = '$SERVICE_VERSION_RANGE_LOWER';
  arch = '$ARCH';

  constructor() {}
}

export class Container {
  name = '$SERVICE_NAME';
  image = 'SERVICE_CONTAINER';
  binds = ['$SHARED_VOLUME:$VOLUME_MOUNT:rw'];
  privileged = true;
  cap_add!: string[];
  devices!: string[];
}

export class Deployment {
  services!: Container;
}

export class Service {
  org = '$HZN_ORG_ID';
  url = '$SERVICE_NAME';
  version = '$SERVICE_VERSION';
  label = '$SERVICE_NAME for $ARCH';
  arch = '$ARCH';
  documentation = 'https://github.com/playground/open-labs/master/edge/services/helloworld/README.md';
  public = false;
  sharable = 'singleton';
  requiredServices!: RequiredService[];
  userInput!: any[];
  deployment!: Deployment; 
  source?: string;
  display?: string;
  owner?: string;
}