"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Deployment = exports.Container = exports.RequiredService = exports.runDirectly = exports.promptForUpdate = exports.justRun = void 0;
exports.justRun = [
    'appendSupport', 'checkConfigState', 'createHznKey', 'editPolicy', 'getDeviceArch', 'isConfigured', 'listAgreement',
    'listDeploymentPolicy', 'listNode', 'listNodePattern', 'listObject', 'listPattern', 'listService', 'removeOrg',
    'removeNode'
];
exports.promptForUpdate = [
    'setup', 'test', 'addDeploymentPolicy', 'addNodePolicy', 'addServicePolicy', 'addPolicy', 'buildAndPublish', 'buildPublishAndRegister',
    'buildMMSImage', 'buildServiceImage', 'editDeploymentPoicy', 'editNodePolicy', 'editServicePolicy', 'publishAndRegister',
    'publishService', 'publishServiceAndPattern', 'publishPattern', 'publishMMSService',
    'publishMMSPattern', 'publishMMSObject', 'publishMMSObjectPolicy', 'pushMMSImage', 'pushServiceImage', 'registerAgent', 'unregisterAgent'
];
exports.runDirectly = ['deleteObject', 'setupManagementHub', 'showHznInfo', 'updateHznInfo', 'uninstallHorizon'];
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