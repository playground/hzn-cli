export declare const justRun: string[];
export declare const promptForUpdate: string[];
export declare const runDirectly: string[];
export declare const loop: string[];
export declare const installTar: {
    x86_64: string;
    x64: string;
    darwin: string;
    arrch64: string;
    arm64: string;
    armv7l: string;
    arm: string;
};
export declare const installPrompt: {
    version: string;
};
export declare const supportPlatform: {
    arm64: string;
    amd64: string;
    arm: string;
};
export interface IHznParam {
    org: string;
    configPath: string;
    name: string;
    objectType: string;
    objectId: string;
    objectFile: string;
    mmsPattern: string;
    action: string;
    watch?: string;
    filter?: string;
    policy: IPolicy;
}
export interface IPolicy {
    envVar: string;
    nodePolicyJson: string;
    servicePolicyJson: string;
    objectPolicyJson: string;
    deploymentPolicyJson: string;
}
export declare class RequiredService {
    org: string;
    url: string;
    version: string;
    versionRange: string;
    arch: string;
    constructor();
}
export declare class Container {
    name: string;
    image: string;
    binds: string[];
    privileged: boolean;
    cap_add: string[];
    devices: string[];
}
export declare class Deployment {
    services: Container;
}
export declare class Service {
    org: string;
    url: string;
    version: string;
    label: string;
    arch: string;
    documentation: string;
    public: boolean;
    sharable: string;
    requiredServices: RequiredService[];
    userInput: any[];
    deployment: Deployment;
    source?: string;
    display?: string;
    owner?: string;
}
