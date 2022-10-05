"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Deployment = exports.Container = exports.RequiredService = exports.supportPlatform = exports.installPrompt = exports.installTar = exports.loop = exports.runDirectly = exports.promptForUpdate = exports.justRun = void 0;
exports.justRun = [
    'addRemoteNodePolicy',
    'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'installAnaxInContainer', 'listAgreement',
    'listDeploymentPolicy', 'listExchangeNode', 'listExchangeNodePolicy', 'listNode', 'listNodePattern', 'listObject', 'listPattern',
    'listPolicy', 'listService', 'listServicePolicy', 'listAllServices', 'publishMMSObject', 'publishMMSObjectPattern', 'publishMMSObjectPolicy',
    'removeDeploymentPolicy', 'removeObject', 'removeOrg',
    'removeNode', 'removeService', 'reviewPolicy', 'reviewServiceDefinition'
];
exports.promptForUpdate = [
    'addPolicy', 'setup', 'test', 'buildAndPublish', 'buildPublishAndRegister',
    'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister',
    'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService',
    'publishMMSPattern', 'pushMMSImage', 'pushServiceImage', 'registerAgent'
];
exports.runDirectly = [
    'appendSupport', 'deleteObject', 'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon', 'unregisterAgent'
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