import { Observable } from 'rxjs';
export declare const promptSync: any;
import { Env } from './env';
import { IHznParam } from './interface';
export declare class Utils {
    etcDefault: string;
    etcHorizon: string;
    homePath: any;
    hznConfig: string;
    constructor();
    init(): void;
    getEtcDefault(): string;
    getHznConfig(): string;
    listAgreement(param: IHznParam): Observable<unknown>;
    listService(param: IHznParam): Observable<unknown>;
    listAllServices(param: IHznParam): Observable<unknown>;
    listPattern(name: string): Observable<unknown>;
    listNode(param: IHznParam): Observable<unknown>;
    listExchangeNode(param: IHznParam): Observable<unknown>;
    listPolicy(): Observable<unknown>;
    listExchangeNodePolicy(param: IHznParam): Observable<unknown>;
    listServicePolicy(name: string): Observable<unknown>;
    listDeploymentPolicy(name: string): Observable<unknown>;
    removeDeploymentPolicy(name: string): Observable<unknown>;
    areYouSure(arg: string, msg: string): Observable<unknown>;
    removeNode(name: string): Observable<unknown>;
    listObject(param: IHznParam): Observable<unknown>;
    createHznKey(org: string, id: string): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    checkOS(): Observable<unknown>;
    getIpAddress(): any[];
    aptUpdate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    cleanUp(): Observable<unknown>;
    installHznCli(anax: string, id: null): Observable<unknown>;
    uninstallHorizon(msg?: string): Observable<unknown>;
    setupManagementHub(): Observable<unknown>;
    copyFile(arg: string): Promise<unknown>;
    appendSupport(): Observable<unknown>;
    getPropsFromEnvLocal(org: string): any[];
    updateEnvFiles(org: string): Observable<unknown>;
    switchEnvironment(org: string, pEnv?: any): Observable<unknown>;
    updateAndSaveCredential(org: string, content: string): Observable<unknown>;
    shallowEqual(obj1: any, obj2: any): boolean;
    updateOrgConfig(hznJson: any, org: string, newOrg?: boolean): Observable<unknown>;
    removeOrg(org: string): Observable<unknown>;
    updateCredential(org: string): void;
    orgCheck(org: string, skipUpdate?: boolean): Observable<unknown>;
    filterEnvVars(result: any): {};
    setupEnvFiles(org: string): Observable<unknown>;
    updateEnvHzn(org: string): Observable<unknown>;
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
    unregisterAgent(): Observable<unknown>;
    promptEditPolicy(): void;
    addPolicy(param: IHznParam, policy: any): Observable<unknown>;
    addDeploymentPolicy(policy: any): Observable<unknown>;
    addServicePolicy(policy: any): Observable<unknown>;
    addNodePolicy(param: IHznParam, policy: any): Observable<unknown>;
    addRemoteNodePolicy(param: IHznParam, policy: any): Observable<unknown>;
    promptPolicySelection(): any;
    reviewPolicy(): Observable<unknown>;
    reviewPolicyType(filename: string): void;
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
}
