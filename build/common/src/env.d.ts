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
    getEnvValue(key: string): string;
    getEnv(): string;
    getOrgId(): string;
    getExchangeUserAuth(): string;
    getExchangeUrl(): string;
    getFSSCSSUrl(): string;
    getServiceName(): string;
    getServiceVersion(): string;
    getMMSSharedVolume(): string;
    getMyDockerHubId(): string;
    getDockerImageBase(): string;
    getMMSContainerCreds(): string;
    getMMSPatterName(): string;
    getMMSServiceName(): string;
    getMMSServiceVersion(): string;
    getMMSContainer(): string;
    getArch(): string;
    getMMSObjectType(): string;
    getMMSObjectId(): string;
    getMMSObjectFile(): string;
    getServiceContainerCreds(): string;
    getPatternName(): string;
    getServiceContainer(): string;
    getAnax(): string;
    getHznNodeID(): string;
}
