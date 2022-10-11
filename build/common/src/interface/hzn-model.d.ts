export declare const justRun: string[];
export declare const promptForUpdate: string[];
export declare const customRun: string[];
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
export declare enum SetupEnvironment {
    autoSetup = 0,
    autoSetupCliOnly = 1,
    autoSetupAnaxInContainer = 2,
    autoSetupCliInContainer = 3,
    autoSetupContainer = 4
}
export declare const keyMap: {
    org: string;
    service: string;
    metaVars: string;
    credential: string;
    envVars: string;
};
export declare const HorizonTemplate: {
    HZN_EXCHANGE_URL: string;
    HZN_FSS_CSSURL: string;
    HZN_DEVICE_ID: string;
    HZN_NODE_ID: string;
    HZN_AGBOT_URL: string;
    HZN_SDO_SVC_URL: string;
    HZN_MGMT_HUB_CERT_PATH: string;
    HZN_AGENT_PORT: string;
};
export declare const HorizonKeyMap: {
    HZN_MGMT_HUB_CERT_PATH: string;
    HZN_CUSTOM_NODE_ID: string;
    DEFAULT_ORG: string;
};
export declare const configTemplate: {
    envHzn: {
        envVars: {
            SERVICE_NAME: string;
            SERVICE_CONTAINER_NAME: string;
            SERVICE_VERSION: string;
            SERVICE_VERSION_RANGE_UPPER: string;
            SERVICE_VERSION_RANGE_LOWER: string;
            SERVICE_CONTAINER_CREDS: string;
            MMS_SERVICE_NAME: string;
            MMS_CONTAINER_NAME: string;
            MMS_SERVICE_VERSION: string;
            MMS_SERVICE_FALLBACK_VERSION: string;
            MMS_CONTAINER_CREDS: string;
            VOLUME_MOUNT: string;
            MMS_SHARED_VOLUME: string;
            MMS_OBJECT_TYPE: string;
            MMS_OBJECT_ID: string;
            MMS_OBJECT_FILE: string;
            UPDATE_FILE_NAME: string;
            HZN_CSS: string;
            EDGE_OWNER: string;
            EDGE_DEPLOY: string;
        };
        credential: {
            HZN_ORG_ID: string;
            HZN_EXCHANGE_USER_AUTH: string;
            HZN_EXCHANGE_URL: string;
            HZN_FSS_CSSURL: string;
            ANAX: string;
        };
        metaVars: {};
    };
    envLocal: {
        YOUR_DOCKERHUB_ID: string;
        DOCKER_REGISTRY: string;
        DOCKER_TOKEN: string;
        HZN_EXCHANGE_USER_AUTH: string;
        HZN_EXCHANGE_URL: string;
        HZN_FSS_CSSURL: string;
        HZN_CUSTOM_NODE_ID: string;
        DEFAULT_ORG: string;
        ANAX: string;
        ANAX_IN_CONTAINER: string;
    };
    envSupport: {
        SUPPORTED_OS_APPEND: string;
        SUPPORTED_LINUX_DISTRO_APPEND: string;
        SUPPORTED_DEBIAN_VARIANTS_APPEND: string;
        SUPPORTED_DEBIAN_VERSION_APPEND: string;
        SUPPORTED_DEBIAN_ARCH_APPEND: string;
        SUPPORTED_REDHAT_VARIANTS_APPEND: string;
        SUPPORTED_REDHAT_VERSION_APPEND: string;
        SUPPORTED_REDHAT_ARCH_APPEND: string;
    };
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
    configFile: string;
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
