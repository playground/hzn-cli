import { Observable } from 'rxjs';
export declare class Utils {
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
    aptUpdate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    installHznCli(anax: string, id: null): Observable<unknown>;
    uninstallHorizon(): Observable<unknown>;
    copyFile(arg: string): Promise<unknown>;
    updateEnvFiles(org: string): Observable<unknown>;
    updateOrgConfig(hznJson: any, org: string, newOrg?: boolean): Observable<unknown>;
    removeOrg(org: string): Observable<unknown>;
    orgCheck(org: string, skipUpdate?: boolean): Observable<unknown>;
    setupEnvFiles(org: string): Observable<unknown>;
    updateEnvHzn(org: string): Observable<unknown>;
    checkDefaultConfig(): Observable<unknown>;
    getHznInfo(): string[];
    showHznInfo(): Observable<unknown>;
    getPropsFromFile(file: string): any[];
    updateHznInfo(): Observable<unknown>;
    shell(arg: string, success?: string, error?: string, options?: {
        maxBuffer: number;
    }): Observable<unknown>;
}
