import { Observable } from 'rxjs';
import { Hzn } from '.';
import { Env } from './env';
import { AutoCommand, IHznParam, SetupEnvironment } from './interface';
import { IAutoParam } from './interface/hzn-model';
export declare const promptSync: any;
export declare class Utils {
    etcDefault: string;
    etcHorizon: string;
    homePath: any;
    hznConfig: string;
    configJson: {};
    constructor();
    init(): void;
    invalidTemplate(json: any): boolean;
    randomString(): string;
    preInstallHznCli(orgId: string, anax: string, nodeId: string, css: string, token: string): Observable<unknown>;
    installCliInContainer(configJson: any): Observable<unknown>;
    createHorizonSystemFiles(configJson: any): Observable<unknown>;
    removeCliContainer(name?: string): Observable<unknown>;
    removeAnaxContainer(name?: string): Observable<unknown>;
    stopRemoveContainer(name: string): Observable<unknown>;
    installCliAndAnaxInContainers(configJson: any): Observable<unknown>;
    installAnaxInContainer(configJson: any): Observable<unknown>;
    updateConfig(configFile: string): Observable<unknown>;
    proceedWithAutoInstall(setup: SetupEnvironment): Observable<unknown>;
    autoRun(params: IAutoParam, setup: SetupEnvironment): Observable<unknown>;
    setEnvFromEnvLocal(): void;
    setEnvFromConfig(configFile: string): Observable<unknown>;
    getTopLevelPatternName(): string;
    getArch(): Observable<unknown>;
    getByKey(file: string, key: string): any;
    autoCommand(params: IAutoParam, command: AutoCommand): Observable<unknown>;
    autoListPolicy(params: IAutoParam): Observable<unknown>;
    autoUpdateNodePolicy(params: IAutoParam): Observable<unknown>;
    autoRegisterWithPolicy(params: IAutoParam): Observable<unknown>;
    autoRegisterWithPattern(params: IAutoParam): Observable<unknown>;
    autoUnregister(params: IAutoParam): Observable<unknown>;
    replaceEnvTokens(input: string, tokens: any): string;
    autoSetup(params: IAutoParam): Observable<unknown>;
    autoSetupCliOnly(params: IAutoParam): Observable<unknown>;
    autoSetupAnaxInContainer(params: IAutoParam): Observable<unknown>;
    autoSetupCliInContainer(params: IAutoParam): Observable<unknown>;
    autoSetupContainer(params: IAutoParam): Observable<unknown>;
    autoSetupAllInOne(params: IAutoParam): Observable<unknown>;
    autoUpdateConfigFiles(params: IAutoParam): Observable<unknown>;
    getEtcDefault(): string;
    getHznConfig(): string;
    listAgreement(param: IHznParam): Observable<unknown>;
    listService(param: IHznParam): Observable<unknown>;
    removeService(name: string): Observable<unknown>;
    listAllServices(param: IHznParam): Observable<unknown>;
    listPattern(name: string): Observable<unknown>;
    listNode(param: IHznParam): Observable<unknown>;
    listNodes(param: IHznParam): Observable<unknown>;
    listOrg(param: IHznParam): Observable<unknown>;
    listExchangeNode(param: IHznParam): Observable<unknown>;
    listPolicy(): Observable<unknown>;
    listExchangeNodePolicy(param: IHznParam): Observable<unknown>;
    listServicePolicy(name: string): Observable<unknown>;
    listDeploymentPolicy(name: string): Observable<unknown>;
    removeDeploymentPolicy(name: string): Observable<unknown>;
    areYouSure(arg: string, msg: string): Observable<unknown>;
    removeNode(name: string): Observable<unknown>;
    listObject(param: IHznParam): Observable<unknown>;
    removeObject(param: IHznParam): Observable<unknown>;
    createHznKey(org: string, id: string): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    checkOS(): Observable<unknown>;
    getIpAddress(): any[];
    aptUpdate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    clearUnconfiguring(): Observable<unknown>;
    purgeManagementHub(): Observable<unknown>;
    cleanUp(): Observable<unknown>;
    installCliOnly(anax: string): Observable<unknown>;
    installHznCli(anax: string, id: string, css: any, deviceToken?: string): Observable<unknown>;
    uninstallHorizon(msg?: string, yes?: string): Observable<unknown>;
    setupManagementHub(): Observable<unknown>;
    copyFile(arg: string): Promise<unknown>;
    appendSupport(): Observable<unknown>;
    getPropsFromEnvLocal(org: string): any[];
    updateEnvFiles(org: string): Observable<unknown>;
    switchEnvironment(org: string, pEnv?: any): Observable<unknown>;
    updateAndSaveCredential(org: string, content: string): Observable<unknown>;
    shallowEqual(obj1: any, obj2: any): boolean;
    promptCliOrAnax(msg?: string): any;
    installAnaxOrCli(container?: boolean): Observable<unknown>;
    updateOrgConfig(hznJson: any, org: string, newOrg?: boolean): Observable<unknown>;
    removeOrg(org: string): Observable<unknown>;
    updateCredential(org: string): void;
    orgCheck(org: string, skipUpdate?: boolean): Observable<unknown>;
    filterEnvVars(result: any): {};
    setupEnvFiles(org: string): Observable<unknown>;
    updateEnvHzn(org: string): Observable<unknown>;
    checkSystemFiles(): Promise<unknown>;
    checkDefaultConfig(): Observable<unknown>;
    getHznInfo(): string[];
    showHznInfo(): Observable<unknown>;
    getPropValueFromFile(file: string, prop: string): string;
    getPropsFromFile(file: string): any[];
    updateHorizon(org: string, pEnv: Env): Observable<unknown>;
    updateCert(org: string, pEnv: Env): Observable<unknown>;
    tokenReplace(template: string, obj: any): string;
    writeHorizon(content: string): Observable<unknown>;
    nameValueToJson(file: string): any;
    updateHznInfo(): Observable<unknown>;
    policyToProps(policy: string): any;
    promptType(propName: string, res: any, el: any): void;
    goPrompt(props: any, propName: string): Promise<unknown>;
    unregisterAsNeeded(): Observable<unknown>;
    unregisterAgent(auto?: boolean, msg?: string): Observable<unknown>;
    register(hzn: Hzn): Observable<unknown>;
    registerOnly(): Observable<unknown>;
    registerWithPolicy(name: string, policy: string, auto?: boolean): Observable<unknown>;
    registerWithPattern(pattern: string, policy: string, auto?: boolean): Observable<unknown>;
    getPolicyJson(type: string): any;
    updatePolicy(param: IHznParam, policy: any): Observable<unknown>;
    addPolicy(param: IHznParam, policy: any, update?: boolean): Observable<unknown>;
    addDeploymentPolicy(policy: any): Observable<unknown>;
    addServicePolicy(policy: any): Observable<unknown>;
    addObjectPolicy(param: IHznParam): Observable<unknown>;
    addObjectPattern(param: IHznParam): void;
    updateNodePolicyFromStdin(param: string): Observable<unknown>;
    updateNodePolicy(param: string): Observable<unknown>;
    addNodePolicy(param: IHznParam, policy: any): Observable<unknown>;
    addRemoteNodePolicy(param: IHznParam, policy: any): Observable<unknown>;
    promptRegisterSelection(msg?: string): any;
    promptPolicySelection(msg?: string): any;
    promptServiceSelection(): any;
    reviewServiceDefinition(): Observable<unknown>;
    reviewPolicy(): Observable<unknown>;
    displayFileContent(filename: string): void;
    editPolicy(): Observable<unknown>;
    editObjectPolicy(): Observable<unknown>;
    editNodePolicy(): Observable<unknown>;
    editDeploymentPolicy(): Observable<unknown>;
    editServicePolicy(): Observable<unknown>;
    getJsonFromFile(jsonFile: string): any;
    editTypePolicy(filename: string): Observable<unknown>;
    isNodeConfigured(): Observable<unknown>;
    shell(arg: string, success?: string, error?: string, prnStdout?: boolean, options?: {
        maxBuffer: number;
    }): Observable<unknown>;
    shell2(arg: string, success?: string, error?: string, prnStdout?: boolean, options?: {
        maxBuffer: number;
    }): Observable<unknown>;
}
