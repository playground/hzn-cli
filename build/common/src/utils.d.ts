import { Observable } from 'rxjs';
export declare class Utils {
    constructor();
    init(): void;
    listService(): Observable<unknown>;
    listPattern(): Observable<unknown>;
    listNode(): Observable<unknown>;
    listObject(): Observable<unknown>;
    listDeploymentPolicy(): Observable<unknown>;
    createHznKey(): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    installHznCli(): Observable<unknown>;
    shell(arg: string): Observable<unknown>;
}
