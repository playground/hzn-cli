import { Observable } from 'rxjs';
export declare class Env {
    env: string;
    envVars: any;
    hznJson: any;
    hznEnv: any;
    hznConfig: string;
    constructor(env: string, hznConfig: string);
    init(): Observable<unknown>;
    setAdditionalEnv(): void;
    updateContainerAndServiceNames(): void;
    getEnvValue(key: string): any;
    getEnv(): string;
    getOrgId(): any;
    setOrgId(orgId?: any): void;
    getExchangeUserAuth(): any;
    getExchangeUrl(): any;
    getFSSCSSUrl(): any;
    getServiceName(): any;
    setServiceName(name: string): void;
    getServiceVersion(): any;
    getMMSSharedVolume(): any;
    getMyDockerHubId(): any;
    getDockerImageBase(): string;
    getMMSContainerCreds(): any;
    getMMSPatterName(): any;
    getMMSServiceName(): any;
    setMMSServiceName(name: string): void;
    getMMSServiceVersion(): any;
    getMMSContainerName(): any;
    getMMSContainer(): any;
    setMMSContainer(container: string): void;
    getArch(): any;
    getMMSObjectType(): any;
    getMMSObjectId(): any;
    getMMSObjectFile(): any;
    getServiceContainerCreds(): any;
    getServiceContainerName(): any;
    getPatternName(): any;
    getServiceContainer(): any;
    setServiceContainer(container: string): void;
    getAnax(): any;
    getInputFilePath(): any;
    getHznNodeID(): any;
    getHznCSS(): any;
    getServiceFlags(): any;
    getHznDeviceToken(): any;
    getDockerRegistry(): any;
    getDockerToken(): any;
    getEdgeOwner(): any;
    getEdgeDeploy(): any;
    getAppPort(): any;
    getExposePort(): any;
}
