import { Observable } from 'rxjs';
import { Utils } from './utils';
export declare const utils: Utils;
export declare class Hzn {
    objectType: any;
    objectId: any;
    objectFile: any;
    pattern: any;
    serviceJson: any;
    patternJson: any;
    policyJson: any;
    mmsPattern: any;
    mmsServiceJson: any;
    mmsPatternJson: any;
    mmsPolicyJson: any;
    nodePolicyJson: string;
    deploymentPolicyJson: string;
    servicePolicyJson: string;
    serviceDefinitionJson: string;
    servicePatternJson: string;
    envVar: any;
    configPath: string;
    name: string;
    constructor(env: string, configPath: string, name: string, objectType: string, objectId: string, objectFile: string, mmsPattern: string);
    init(): Observable<unknown>;
    test(): Observable<unknown>;
    setup(): Observable<unknown>;
    appendSupport(): Observable<unknown>;
    buildServiceImage(): Observable<unknown>;
    pushServiceImage(): Observable<unknown>;
    buildMMSImage(): Observable<unknown>;
    pushMMSImage(): Observable<unknown>;
    pullDockerImage(): Observable<unknown>;
    dockerImageExists(): Observable<unknown>;
    publishService(): Observable<unknown>;
    publishPattern(): Observable<unknown>;
    publishMMSService(): Observable<unknown>;
    publishMMSPattern(): Observable<unknown>;
    unregisterAgent(): Observable<unknown>;
    registerAgent(): Observable<unknown>;
    publishMMSObject(): Observable<unknown>;
    buildAndPublish(): Observable<unknown>;
    publishServiceAndPattern(): Observable<unknown>;
    buildPublishAndRegister(): Observable<unknown>;
    publishAndRegister(): Observable<unknown>;
    editPolicy(): Observable<unknown>;
    editDeploymentPolicy(): void;
    editNodePolicy(): Observable<unknown>;
    editServicePolicy(): Observable<unknown>;
    addDeploymentPolicy(): Observable<unknown>;
    addServicePolicy(): Observable<unknown>;
    addNodePolicy(): Observable<unknown>;
    showHznInfo(): Observable<unknown>;
    updateHznInfo(): Observable<unknown>;
    listService(): Observable<unknown>;
    isConfigured(): Observable<unknown>;
    listPattern(): Observable<unknown>;
    listNode(): Observable<unknown>;
    listObject(): Observable<unknown>;
    listDeploymentPolicy(): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    createHznKey(): Observable<unknown>;
    aptUpdate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    installHznCli(): Observable<unknown>;
    uninstallHorizon(): Observable<unknown>;
    preInstallHznCli(): Observable<unknown>;
    setupManagementHub(): Observable<unknown>;
    setupRedHat(): Observable<unknown>;
    getIpAddress(): Observable<unknown>;
}
