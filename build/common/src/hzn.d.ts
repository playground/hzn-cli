import { Observable } from 'rxjs';
import { IHznParam, IPolicy } from './interface';
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
    topLevelDeploymentPolicyJson: string;
    servicePolicyJson: string;
    objectPolicyJson: string;
    objectPatternJson: string;
    serviceDefinitionJson: string;
    servicePatternJson: string;
    envVar: any;
    configPath: string;
    name: string;
    org: string;
    param: IHznParam;
    utils: Utils;
    constructor(param: IHznParam);
    init(cliBypass?: boolean, cliOptional?: boolean): Observable<unknown>;
    test(): Observable<unknown>;
    setup(): Observable<unknown>;
    updateConfigFile(): Observable<unknown>;
    appendSupport(): Observable<unknown>;
    installAnaxInContainer(): Observable<unknown>;
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
    createDeployment(): Observable<unknown>;
    createNetworkSegment(): Observable<unknown>;
    exposeDeployment(): Observable<unknown>;
    uninstallAgent(): Observable<unknown>;
    setDefaultNamespace(): void;
    meshNodeList(): Observable<unknown>;
    meshAgreementList(): Observable<unknown>;
    meshAgentEventLog(): Observable<unknown>;
    deleteAgentNamespace(): Observable<unknown>;
    meshPodList(): Observable<unknown>;
    meshServiceList(): Observable<unknown>;
    registerMeshAgent(): Observable<unknown>;
    unregisterMeshAgentByName(): Observable<unknown>;
    unregisterMeshAgent(): Observable<unknown>;
    unregisterAgent(): Observable<unknown>;
    register(): Observable<unknown>;
    registerAgent(): Observable<unknown>;
    publishMMSObject(): Observable<unknown>;
    publishMMSObjectPattern(): Observable<unknown>;
    publishMMSObjectPolicy(): Observable<unknown>;
    buildAndPublish(): Observable<unknown>;
    publishServiceAndPattern(): Observable<unknown>;
    buildPublishAndRegister(): Observable<unknown>;
    publishAndRegister(): Observable<unknown>;
    getPolicyInfo(): IPolicy;
    reviewServiceDefinition(): Observable<unknown>;
    reviewPolicy(): Observable<unknown>;
    editPolicy(): Observable<unknown>;
    editDeploymentPolicy(): void;
    editNodePolicy(): Observable<unknown>;
    editServicePolicy(): Observable<unknown>;
    addPolicy(): Observable<unknown>;
    updatePolicy(): Observable<unknown>;
    addDeploymentPolicy(): Observable<unknown>;
    addServicePolicy(): Observable<unknown>;
    addNodePolicy(): Observable<unknown>;
    addRemoteNodePolicy(): Observable<unknown>;
    showHznInfo(): Observable<unknown>;
    updateHznInfo(): Observable<unknown>;
    listAgreement(): Observable<unknown>;
    listService(): Observable<unknown>;
    listAllServices(): Observable<unknown>;
    removeService(): Observable<unknown>;
    isConfigured(): Observable<unknown>;
    listPattern(): Observable<unknown>;
    listNode(): Observable<unknown>;
    listNodes(): Observable<unknown>;
    listOrg(): Observable<unknown>;
    listExchangeNode(): Observable<unknown>;
    removeNode(): Observable<unknown>;
    listObject(): Observable<unknown>;
    removeObject(): Observable<unknown>;
    listPolicy(): Observable<unknown>;
    listExchangeNodePolicy(): Observable<unknown>;
    listServicePolicy(): Observable<unknown>;
    listDeploymentPolicy(): Observable<unknown>;
    removeDeploymentPolicy(): Observable<unknown>;
    deleteObject(): Observable<unknown>;
    deployCheck(): Observable<unknown>;
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
