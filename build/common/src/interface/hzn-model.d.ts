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
