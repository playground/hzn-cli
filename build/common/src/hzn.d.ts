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
    envVar: any;
    configPath: string;
    name: string;
    constructor(env: string, configPath: string, name: string, objectType: string, objectId: string, objectFile: string, mmsPattern: string);
    setup(): Observable<unknown>;
    test(): Observable<unknown>;
    buildServiceImage(): Observable<unknown>;
    pushServiceImage(): Observable<unknown>;
    buildMMSImage(): Observable<unknown>;
    pushMMSImage(): Observable<unknown>;
    publishMMSService(): Observable<unknown>;
    publishMMSPattern(): Observable<unknown>;
    unregisterAgent(): Observable<unknown>;
    registerAgent(): Observable<unknown>;
    publishMMSObject(): Observable<unknown>;
    allInOneMMS(): Observable<unknown>;
    publishService(): Observable<unknown>;
    publishPattern(): Observable<unknown>;
    showHznInfo(): Observable<unknown>;
    updateHznInfo(): Observable<unknown>;
    listService(): Observable<unknown>;
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
    setupRedHat(): Observable<unknown>;
}
