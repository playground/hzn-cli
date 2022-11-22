"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Deployment = exports.Container = exports.RequiredService = exports.configTemplate = exports.HorizonKeyMap = exports.HorizonTemplate = exports.keyMap = exports.AutoCommand = exports.SetupEnvironment = exports.policyType = exports.supportPlatform = exports.installPrompt = exports.installTar = exports.loop = exports.runDirectly = exports.customRun = exports.promptForUpdate = exports.justRun = void 0;
exports.justRun = [
    'addPolicy', 'addRemoteNodePolicy', 'updatePolicy',
    'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'listAgreement',
    'listDeploymentPolicy', 'listExchangeNode', 'listExchangeNodePolicy', 'listNode', 'listNodes', 'listOrg', 'listNodePattern', 'listObject', 'listPattern',
    'listPolicy', 'listService', 'listServicePolicy', 'listAllServices', 'publishMMSObject', 'publishMMSObjectPattern', 'publishMMSObjectPolicy',
    'register', 'removeDeploymentPolicy', 'removeObject', 'removeOrg',
    'removeNode', 'removeService', 'reviewPolicy', 'reviewServiceDefinition'
];
exports.promptForUpdate = [
    'setup', 'test', 'buildAndPublish', 'buildPublishAndRegister',
    'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister',
    'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService',
    'publishMMSPattern', 'pushMMSImage', 'pushServiceImage', 'registerAgent'
];
exports.customRun = [
    'autoSetup', 'autoSetupAllInOne', 'autoSetupCliOnly', 'autoSetupCliInContainer', 'autoSetupAnaxInContainer', 'autoSetupContainer',
    'autoRegisterWithPolicy', 'autoRegisterWithPattern', 'autoUnregister', 'autoUpdateConfigFiles', 'autoUpdateNodePolicy',
    'cleanUp', 'clearUnconfiguring', 'purgeManagementHub'
];
exports.runDirectly = [
    'appendSupport', 'deleteObject', 'removeCliContainer', 'removeAnaxContainer', 'stopRemoveContainer',
    'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon', 'unregisterAgent'
];
exports.loop = [
    'addPolicy', 'editPolicy', 'reviewPolicy', 'reviewServiceDefinition'
];
exports.installTar = {
    "x86_64": "horizon-agent-linux-deb-amd64.tar.gz",
    "x64": "horizon-agent-linux-deb-amd64.tar.gz",
    "darwin": "horizon-agent-macos-pkg-x86_64.tar.gz",
    "arrch64": "horizon-agent-linux-deb-arm64.tar.gz",
    "arm64": "horizon-agent-linux-deb-arm64.tar.gz",
    "armv7l": "horizon-agent-linux-deb-armhf.tar.gz",
    "arm": "horizon-agent-linux-deb-armhf.tar.gz"
};
exports.installPrompt = {
    "version": "latest"
};
exports.supportPlatform = {
    "arm64": "linux/arm64",
    "amd64": "linux/amd64",
    "arm": "linux/arm/v7"
};
exports.policyType = {
    "nodePolicy": "nodePolicyJson",
    "deploymentPolicy": "deploymentPolicyJson",
    "servicePolicy": "servicePolicyJson",
    "objectPolicy": "objectPolicyJson",
    "objectPattern": "objectPatternJson"
};
var SetupEnvironment;
(function (SetupEnvironment) {
    SetupEnvironment[SetupEnvironment["autoSetup"] = 0] = "autoSetup";
    SetupEnvironment[SetupEnvironment["autoSetupCliOnly"] = 1] = "autoSetupCliOnly";
    SetupEnvironment[SetupEnvironment["autoSetupAnaxInContainer"] = 2] = "autoSetupAnaxInContainer";
    SetupEnvironment[SetupEnvironment["autoSetupCliInContainer"] = 3] = "autoSetupCliInContainer";
    SetupEnvironment[SetupEnvironment["autoSetupContainer"] = 4] = "autoSetupContainer";
    SetupEnvironment[SetupEnvironment["autoSetupAllInOne"] = 5] = "autoSetupAllInOne";
    SetupEnvironment[SetupEnvironment["autoUpdateConfigFiles"] = 6] = "autoUpdateConfigFiles";
})(SetupEnvironment = exports.SetupEnvironment || (exports.SetupEnvironment = {}));
var AutoCommand;
(function (AutoCommand) {
    AutoCommand[AutoCommand["autoPublishService"] = 0] = "autoPublishService";
    AutoCommand[AutoCommand["autoPublishMMSService"] = 1] = "autoPublishMMSService";
    AutoCommand[AutoCommand["autoAddDeploymentPolicy"] = 2] = "autoAddDeploymentPolicy";
    AutoCommand[AutoCommand["autoUpdateNodePolicy"] = 3] = "autoUpdateNodePolicy";
    AutoCommand[AutoCommand["autoRegisterWithPolicy"] = 4] = "autoRegisterWithPolicy";
    AutoCommand[AutoCommand["autoRegisterWithPattern"] = 5] = "autoRegisterWithPattern";
    AutoCommand[AutoCommand["autoUnregister"] = 6] = "autoUnregister";
})(AutoCommand = exports.AutoCommand || (exports.AutoCommand = {}));
exports.keyMap = {
    org: 'credential',
    service: 'envVars',
    metaVars: 'metaVars',
    credential: 'org',
    envVars: 'service'
};
exports.HorizonTemplate = {
    "HZN_EXCHANGE_URL": "",
    "HZN_FSS_CSSURL": "",
    "HZN_DEVICE_ID": "",
    "HZN_NODE_ID": "",
    "HZN_AGBOT_URL": "",
    "HZN_SDO_SVC_URL": "",
    "HZN_MGMT_HUB_CERT_PATH": "/var/agent-install.crt",
    "HZN_AGENT_PORT": ""
};
exports.HorizonKeyMap = {
    "HZN_MGMT_HUB_CERT_PATH": "CONFIG_CERT_PATH",
    "HZN_CUSTOM_NODE_ID": 'HZN_DEVICE_ID',
    "DEFAULT_ORG": "HZN_ORG_ID"
};
exports.configTemplate = {
    envHzn: {
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
            "HZN_CSS": "false",
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
        "metaVars": {}
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
};
class RequiredService {
    constructor() {
        this.org = '$HZN_ORG_ID';
        this.url = '$SERVICE_NAME';
        this.version = '$SERVICE_VERSION_RANGE_UPPER';
        this.versionRange = '$SERVICE_VERSION_RANGE_LOWER';
        this.arch = '$ARCH';
    }
}
exports.RequiredService = RequiredService;
class Container {
    constructor() {
        this.name = '$SERVICE_NAME';
        this.image = 'SERVICE_CONTAINER';
        this.binds = ['$SHARED_VOLUME:$VOLUME_MOUNT:rw'];
        this.privileged = true;
    }
}
exports.Container = Container;
class Deployment {
}
exports.Deployment = Deployment;
class Service {
    constructor() {
        this.org = '$HZN_ORG_ID';
        this.url = '$SERVICE_NAME';
        this.version = '$SERVICE_VERSION';
        this.label = '$SERVICE_NAME for $ARCH';
        this.arch = '$ARCH';
        this.documentation = 'https://github.com/playground/open-labs/master/edge/services/helloworld/README.md';
        this.public = false;
        this.sharable = 'singleton';
    }
}
exports.Service = Service;
//# sourceMappingURL=hzn-model.js.map