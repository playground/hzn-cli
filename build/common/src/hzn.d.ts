import { Observable } from 'rxjs';
import { Utils } from './utils';
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
    envVar: any;
    utils: Utils;
    constructor(env: any);
    setup(): Observable<unknown>;
    test(): Observable<unknown>;
    buildMMSImage(): Observable<unknown>;
    pushMMSImage(): Observable<unknown>;
    publishMMSService(): Observable<unknown>;
    publishMMSPattern(): Observable<unknown>;
    agentRun(): Observable<unknown>;
    publishMMSObject(): Observable<unknown>;
    unregisterAgent(): Observable<unknown>;
    registerAgent(): Observable<unknown>;
    publishService(): Observable<unknown>;
    publishPattern(): Observable<unknown>;
    showHorizonInfo(): Observable<unknown>;
    getHorizonInfo(): string[];
    updateHorizonInfo(): Observable<unknown>;
    copyFile(arg: string): Promise<unknown>;
    listService(): Observable<unknown>;
    listPattern(): Observable<unknown>;
    listNode(): Observable<unknown>;
    listObject(): Observable<unknown>;
    listDeploymentPolicy(): Observable<unknown>;
    checkConfigState(): Observable<unknown>;
    listNodePattern(): Observable<unknown>;
    getDeviceArch(): Observable<unknown>;
    createHznKey(): Observable<unknown>;
    installHznCli(): Observable<unknown>;
}
