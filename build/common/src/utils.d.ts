import { Observable } from 'rxjs';
export declare const promptSync: any;
export declare class Utils {
    etcDefault: string;
    homePath: string;
    hznConfig: string;
    constructor();
    init(): void;
    getHznConfig(): string;
    listService(name: string): Observable<unknown>;
    listPattern(name: string): Observable<unknown>;
    listNode(name: string): Observable<unknown>;
    listObject(name: string): Observable<unknown>;
    listDeploymentPolicy(name: string): Observable<unknown>;
    createHznKey(org: string, id: string): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    checkOS(): Observable<unknown>;
    getIpAddress(): any[];
    aptUpdate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    installHznCli(anax: string, id: null): Observable<unknown>;
    uninstallHorizon(): Observable<unknown>;
    setupManagementHub(): Observable<unknown>;
    copyFile(arg: string): Promise<unknown>;
    appendSupport(): Observable<unknown>;
    getPropsFromEnvLocal(org: string): any[];
    updateEnvFiles(org: string): Observable<unknown>;
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
    updateHorizon(org: string): void;
    tokenReplace(template: string, obj: any): string;
    nameValueToJson(file: string): any;
    updateHznInfo(): Observable<unknown>;
    policyToProps(policy: string): any;
    promptType(propName: string, res: any, el: any): void;
    goPrompt(props: any, propName: string): Promise<unknown>;
    unregisterAgent(): Observable<unknown>;
    addPolicy(policy: any): Observable<unknown>;
    addDeploymentPolicy(policy: any): Observable<unknown>;
    addServicePolicy(policy: any): Observable<unknown>;
    addNodePolicy(policy: any): Observable<unknown>;
    editPolicy(): Observable<unknown>;
    editObjectPolicy(): Observable<unknown>;
    editNodePolicy(): Observable<unknown>;
    editDeploymentPolicy(): Observable<unknown>;
    editServicePolicy(): Observable<unknown>;
    getJsonFromFile(jsonFile: string): any;
    editTypePolicy(filename: string): Observable<unknown>;
    isNodeConfigured(): Observable<unknown>;
    shell(arg: string, success?: string, error?: string, options?: {
        maxBuffer: number;
    }): Observable<unknown>;
}
