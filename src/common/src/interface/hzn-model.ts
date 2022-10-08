export const justRun = [
  'addRemoteNodePolicy',
  'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'installAnaxInContainer', 'listAgreement', 
  'listDeploymentPolicy', 'listExchangeNode', 'listExchangeNodePolicy', 'listNode', 'listNodes', 'listOrg', 'listNodePattern', 'listObject', 'listPattern', 
  'listPolicy', 'listService', 'listServicePolicy', 'listAllServices', 'publishMMSObject', 'publishMMSObjectPattern', 'publishMMSObjectPolicy', 
  'removeDeploymentPolicy', 'removeObject', 'removeOrg', 
  'removeNode', 'removeService', 'reviewPolicy', 'reviewServiceDefinition'
];
export const promptForUpdate = [
  'addPolicy', 'setup', 'test', 'buildAndPublish', 'buildPublishAndRegister', 
  'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister', 
  'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService', 
  'publishMMSPattern', 'pushMMSImage', 'pushServiceImage', 'registerAgent'
];
export const customRun = [
  'autoSetup', 'autoSetupCliOnly', 'cleanUp'
];
export const runDirectly = [
  'appendSupport', 'deleteObject', 'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon', 'unregisterAgent'
];
export const loop = [
  'addPolicy', 'editPolicy', 'reviewPolicy', 'reviewServiceDefinition'
]
export const installTar = {
  "x86_64": "horizon-agent-linux-deb-amd64.tar.gz",
  "x64": "horizon-agent-linux-deb-amd64.tar.gz",
  "darwin": "horizon-agent-macos-pkg-x86_64.tar.gz",
  "arrch64": "horizon-agent-linux-deb-arm64.tar.gz",
  "arm64": "horizon-agent-linux-deb-arm64.tar.gz",
  "armv7l": "horizon-agent-linux-deb-armhf.tar.gz",
  "arm": "horizon-agent-linux-deb-armhf.tar.gz"
}
export const installPrompt = {
  "version": "latest"
}
export const supportPlatform = {
  "arm64": "linux/arm64",
  "amd64": "linux/amd64",
  "arm": "linux/arm/v7"
}

export const keyMap = {
  org: 'credential',
  service: 'envVars',
  metaVars: 'metaVars',
  credential: 'org',
  envVars: 'service'
}

export const configTemplate = {
  envHzn:   {
    "envVars": {
      "SERVICE_NAME": "saved-model-service",
      "SERVICE_CONTAINER_NAME": "saved-model-service",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_VERSION_RANGE_UPPER": "1.0.0",
      "SERVICE_VERSION_RANGE_LOWER": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "",
      "MMS_SERVICE_NAME": "mms-service",
      "MMS_CONTAINER_NAME": "mms-service",
      "MMS_SERVICE_VERSION": "1.0.0",
      "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",
      "MMS_CONTAINER_CREDS": "",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "mms_shared_volume",
      "MMS_OBJECT_TYPE": "object_detection",
      "MMS_OBJECT_ID": "config.json",
      "MMS_OBJECT_FILE": "config/config.json",
      "UPDATE_FILE_NAME": "model.zip",
      "EDGE_OWNER": "",
      "EDGE_DEPLOY": ""
    },
    "credential": {
      "HZN_ORG_ID": "",
      "HZN_EXCHANGE_USER_AUTH": "",
      "HZN_EXCHANGE_URL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-exchange/v1",
      "HZN_FSS_CSSURL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-css",
      "ANAX": "api/v1/objects/IBM/agent_files/agent-install.sh/data"
    },
    "metaVars": {
    }
  },
  envLocal: {
    "YOUR_DOCKERHUB_ID": "",
    "DOCKER_REGISTRY": "",
    "DOCKER_TOKEN": "",
    "HZN_EXCHANGE_USER_AUTH": "",
    "HZN_EXCHANGE_URL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-exchange/v1",
    "HZN_FSS_CSSURL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-css",
    "HZN_CUSTOM_NODE_ID": "",
    "DEFAULT_ORG": "biz",
    "ANAX": "api/v1/objects/IBM/agent_files/agent-install.sh/data",
    "ANAX_IN_CONTAINER": "true"
  },
  envSupport: {
    "SUPPORTED_OS_APPEND": "",
    "SUPPORTED_LINUX_DISTRO_APPEND": "",
    "SUPPORTED_DEBIAN_VARIANTS_APPEND": "",
    "SUPPORTED_DEBIAN_VERSION_APPEND": "",
    "SUPPORTED_DEBIAN_ARCH_APPEND": "",
    "SUPPORTED_REDHAT_VARIANTS_APPEND": "",
    "SUPPORTED_REDHAT_VERSION_APPEND": "",
    "SUPPORTED_REDHAT_ARCH_APPEND": ""
  }
}

export interface IHznParam {
  org: string;
  configPath: string;
  name: string;
  objectType: string;
  objectId: string;
  objectFile: string;
  mmsPattern: string;
  action: string;
  watch?: string;
  filter?: string;
  policy: IPolicy;
  configFile: string;
}
export interface IPolicy {
  envVar: string;
  nodePolicyJson: string;
  servicePolicyJson: string;
  objectPolicyJson: string;
  deploymentPolicyJson: string;
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