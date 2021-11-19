import { Observable } from 'rxjs';
export declare class Utils {
    constructor();
    init(): void;
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
    getHznInfo(): string[];
    showHznInfo(): Observable<unknown>;
    updateHznInfo(): Observable<unknown>;
    shell(arg: string, success?: string, error?: string, options?: {
        maxBuffer: number;
    }): Observable<unknown>;
}
