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
    aptUpate(): Observable<unknown>;
    installPrereq(): Observable<unknown>;
    installHznCli(): Observable<unknown>;
    shell(arg: string): Observable<unknown>;
}
