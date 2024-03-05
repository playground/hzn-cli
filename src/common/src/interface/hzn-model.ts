export const justRun = [
  'addPolicy', 'addRemoteNodePolicy', 'updatePolicy',
  'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'listAgreement', 
  'listDeploymentPolicy', 'listExchangeNode', 'listExchangeNodePolicy', 'listNode', 'listNodes', 'listOrg', 'listNodePattern', 'listObject', 'listPattern', 
  'listPolicy', 'listService', 'listServicePolicy', 'listAllServices', 'publishMMSObject', 'publishMMSObjectPattern', 'publishMMSObjectPolicy', 
  'register', 'removeDeploymentPolicy', 'removeObject', 'removeOrg', 'updateConfigFile',
  'removeNode', 'removeService', 'reviewPolicy', 'reviewServiceDefinition', 'createNetworkSegment', 'meshPodList', 'meshServiceList',
  'unregisterMeshAgent', 'unregisterMeshAgentByName', 'registerMeshAgent', 'createDeployment', 'exposeDeployment', 'meshNodeList', 'meshAgreementList'
];
export const cliBypass = [
  'updateConfigFile'
]
export const justRunCliOptional = [
  'registerMeshAgent', 'unregisterMeshAgent', 'unregisterMeshAgentByName', 'createDeployment', 'exposeDeployment', 'meshNodeList', 'meshAgreementList', 'createNetworkSegment'
];
export const promptForUpdate = [
  'setup', 'test', 'buildAndPublish', 'buildPublishAndRegister', 
  'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister', 
  'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService', 
  'publishMMSPattern', 'pushMMSImage', 'pushServiceImage', 'registerAgent'
];
export const customRun = [
  'autoListPolicy',
  'autoSetup', 'autoSetupAllInOne', 'autoSetupCliOnly', 'autoSetupCliInContainer', 'autoSetupAnaxInContainer', 'autoSetupContainer',
  'autoRegisterWithPolicy', 'autoRegisterWithPattern', 'autoUnregister', 'autoUpdateConfigFiles', 'autoUpdateNodePolicy',
  'cleanUp', 'clearUnconfiguring', 'purgeManagementHub', 'autoSetupOpenHorizonMesh'
];
export const runDirectly = [
  'appendSupport', 'deleteObject', 'removeCliContainer', 'removeAnaxContainer', 'stopRemoveContainer', 'updateConfig',
  'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon', 'unregisterAgent', 'uninstallK3s', 'installK3s',
  'installK8s', 'uninstallK8s'
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
export const policyType = {
  "nodePolicy": "nodePolicyJson",
  "deploymentPolicy": "deploymentPolicyJson",
  "servicePolicy": "servicePolicyJson",
  "objectPolicy": "objectPolicyJson",
  "objectPattern": "objectPatternJson"
}
export enum SetupEnvironment {
  autoSetup = 0,
  autoSetupCliOnly = 1,
  autoSetupAnaxInContainer = 2,
  autoSetupCliInContainer = 3,
  autoSetupContainer = 4,
  autoSetupAllInOne = 5,
  autoUpdateConfigFiles = 6,
  autoSetupOpenHorizonMesh = 7
}
export enum AutoCommand {
  autoPublishService = 0,
  autoPublishMMSService = 1,
  autoAddDeploymentPolicy = 2,
  autoUpdateNodePolicy = 3,
  autoRegisterWithPolicy = 4,
  autoRegisterWithPattern = 5,
  autoUnregister = 6,
  autoListPolicy = 7
}
export const keyMap = {
  org: 'credential',
  service: 'envVars',
  metaVars: 'metaVars',
  credential: 'org',
  envVars: 'service'
}
export const HorizonTemplate = {
  "HZN_EXCHANGE_URL": "",
  "HZN_FSS_CSSURL": "",
  "HZN_DEVICE_ID": "",
  "HZN_NODE_ID": "",
  "HZN_AGBOT_URL": "",
  "HZN_SDO_SVC_URL": "",
  "HZN_MGMT_HUB_CERT_PATH": "",
  "HZN_AGENT_PORT": ""
}
export const HorizonKeyMap = {
  //"HZN_MGMT_HUB_CERT_PATH": "CONFIG_CERT_PATH",
  "HZN_CUSTOM_NODE_ID": 'HZN_DEVICE_ID',
  "DEFAULT_ORG": "HZN_ORG_ID"
}
export const configTemplate = {
  envHzn:   {
    "envVars": {
      "SERVICE_NAME": "mms-agent",
      "SERVICE_CONTAINER_NAME": "mms-agent",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_VERSION_RANGE_UPPER": "1.0.0",
      "SERVICE_VERSION_RANGE_LOWER": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "",
      "MMS_SERVICE_NAME": "mms-agent",
      "MMS_CONTAINER_NAME": "mms-agent",
      "MMS_SERVICE_VERSION": "1.0.0",
      "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",
      "MMS_CONTAINER_CREDS": "",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "mms_shared_volume",
      "MMS_OBJECT_TYPE": "mms_agent_config",
      "MMS_OBJECT_ID": "mms_agent_config_json",
      "MMS_OBJECT_FILE": "config/config.json",
      "UPDATE_FILE_NAME": "mms-agent-config.json",
      "SERVICE_CONSTRAINTS": "mms-agent == \"MMS Agent\"",
      "HZN_CSS": "false",
      "EDGE_OWNER": "",
      "EDGE_DEPLOY": ""
    },
    "credential": {
      "HZN_ORG_ID": "",
      "HZN_DEVICE_ID": "fyre-cluster-frontend-ns-agent",
      "HZN_EXCHANGE_USER_AUTH": "",
      "HZN_EXCHANGE_URL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-exchange/v1",
      "HZN_FSS_CSSURL": "https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-css",
      "ANAX": "api/v1/objects/IBM/agent_files/agent-install.sh/data",
      "MESH_API_KEY": "",
      "MESH_ENDPOINT": "https://mcnm-preprod.multicloud-mesh-preprod.test.cloud.ibm.com",
      "PALMCTL_FILE_NAME": "palmctl_latest_amd64.deb",
      "USE_EDGE_CLUSTER_REGISTRY": false,
      "ENABLE_AUTO_UPGRADE_CRONJOB": false,
      "IMAGE_ON_EDGE_CLUSTER_REGISTRY": "docker.io/openhorizon/amd64_anax_k8s",
      "EDGE_CLUSTER_REGISTRY_USERNAME": "",
      "EDGE_CLUSTER_REGISTRY_TOKEN": "",
      "EDGE_CLUSTER_STORAGE_CLASS": "local-path",
      "AGENT_NAMESPACE": "frontend-test-ns",
      "KUBECONFIG": "$HOME/.kube/config"
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

export interface IAutoParam {
  configFile: string;
  object: Object;
  k8s: string;
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
  image: string;
  port: string;
  type: string;
  k8s: string;
  compatibility: string;
}
export interface IPolicy {
  envVar: string;
  nodePolicyJson: string;
  servicePolicyJson: string;
  objectPolicyJson: string;
  deploymentPolicyJson: string;
  topLevelDeploymentPolicyJson: string;
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

export const PlatformDistro = {
  darwin: 'darwin',
  freebsd: 'freebsd',
  linux: 'linux',
  win32: 'win32',
  ubuntu: 'ubuntu',
  fedora: 'fefora',
  centos: 'centos',
  rhel: 'rhel'
}

export const ICommand = {
  'apt-get': (os: string) => ['darwin', 'ubuntu'].indexOf(os) >= 0 ? 'apt-get' : 'dnf'
}

export const PalmCtl = {
  rhel: {
    "x86_64": "palmctl_latest_x86_64.rpm",
    "x64": "palmctl_latest_x86_64.rpm"  
  },
  darwin: {
    "i386": "palmctl_latest_macos_amd64.tar.gz",
    "arm64": "palmctl_latest_macos_arm64.tar.gz",  
  },
  win32: {

  },
  linux: {
    "x86_64": "horizon-agent-linux-deb-amd64.tar.gz",
    "x64": "horizon-agent-linux-deb-amd64.tar.gz"  
  }
}
const k8sAMD64 = `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"`;
const k8sARM64 = `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"`;
const k8sAMD64Validate = `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"`;
const k8sARM64Validate = `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl.sha256"`;
export const K8sInstall = {
  "x86_64": {install: k8sAMD64, validate: k8sAMD64Validate},
  "x64": {install: k8sAMD64, validate: k8sAMD64Validate},
  "darwin": {install: k8sARM64, validate: k8sARM64Validate},
  "arrch64": {install: k8sARM64, validate: k8sARM64Validate},
  "arm64": {install: k8sARM64, validate: k8sARM64Validate}
}
