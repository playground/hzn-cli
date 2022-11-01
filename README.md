# hzn-cli

## IEAM / Open Horizon Toolkit

Open Horizon toolkit is a CLI built with Typescript for the NodeJS developers. It is intended to help streamline the process of preparing & deploying applications/services for node agents and to provide a set of convient methods to perform various tasks between orgs environments.

## This toolkit comes with the following convenient commnands

## A complete guide is available below

## Pre-release version of hzn-cli, howto?

### Docker image

Containerized version is available here `docker pull playbox21/hzn-cli[amd64|arm]`

### To setup Edge Node Agent, All-In-One and etc.

`curl -sSL https://raw.githubusercontent.com/playground/hzn-cli/main/install.sh --output install.sh && bash ./install.sh`

OR

### To setup manually.

`npm i -g hzn-cli`

After installlation run

`oh deploy -h`

```
Deploy <action> to Org <org>

Positionals:
  action  Available actions: addPolicy addRemoteNodePolicy appendSupport
          autoSetup autoSetupAnaxInContainer autoSetupCliInContainer
          autoSetupCliOnly autoSetupContainer buildAndPublish buildMMSImage
          buildPublishAndRegister buildServiceImage checkConfigState cleanUp
          createHznKey deleteObject editDeploymentPoicy editNodePolicy
          editPolicy editServicePolicy getDeviceArch isConfigured listAgreement
          listAllServices listDeploymentPolicy listExchangeNode
          listExchangeNodePolicy listNode listNodePattern listNodes listObject
          listOrg listPattern listPolicy listService listServicePolicy
          publishAndRegister publishMMSObject publishMMSObjectPattern
          publishMMSObjectPolicy publishMMSPattern publishMMSService
          publishPattern publishService publishServiceAndPattern pushMMSImage
          pushServiceImage registerAgent removeAnaxContainer removeCliContainer
          removeDeploymentPolicy removeNode removeObject removeOrg removeService
          reviewPolicy reviewServiceDefinition setup setupManagementHub
          showHznInfo stopRemoveContainer test uninstallHorizon unregisterAgent
          updateHznInfo                                      [string] [required]

Options:
      --version             Show version number                        [boolean]
      --org                 Organization to be deployed to              [string]
      --config_path         Specify path to your configuration, default is
                            ./config                                    [string]
      --name                Name of service, pattern, policy & etc.     [string]
      --object_type         Type of object                              [string]
      --object_id           Id of object to be published                [string]
      --object              Object file to be published                 [string]
      --pattern             Pattern name                                [string]
      --watch               watch = true/false                          [string]
      --filter              filter search result = arm, amd64, arm64 & etc
                                                                        [string]
      --skip_config_update  Do not prompt for config updates = true/false
                                                                        [string]
      --config_file         Provide config json file for auto setup     [string]
  -h, --help                Show help                                  [boolean]
```

## To setup your environment, you will need to run

`oh deploy setup`

This will prompt you for your credential, Docker Hub Id & other configuration parameters.
This will also install and setup hzn envirnoment for you if it hasn't been installled.

## To execute any of the "oh" actions

`oh deploy <action>, for example: oh deploy registerAgent`

## After installation and initialization, you can test out the cli by running

`oh deploy test`

```

  _                                    _   _
 | |__    ____  _ __             ___  | | (_)
 | '_ \  |_  / | '_ \   _____   / __| | | | |
 | | | |  / /  | | | | |_____| | (__  | | | |
 |_| |_| /___| |_| |_|          \___| |_| |_|

$$$  test biz /home/ubuntu/config
it works...arm
process completed.
```

## Here are a few examples of actions you can perform with "oh", default org is "biz"

Build service docker image
`oh deploy buildServiceImage`

Push service docker image
`oh deploy pushServiceImage`

Publish service to management hub
`oh deploy publishService`

Publish service pattern
`oh deploy publishPattern`

Publish MMS service
`oh deploy publishMMSService`

Publish MMS pattern and specify path to the policy.json
`oh deploy publishMMSPattern --config_path /home/pi/config`

Publish MMS Object file
`oh deploy publishMMSObject --object_type=object_detection --object_id=config.json --object=/Users/jeff/Downloads/demo-model/demo/version1/model.zip --pattern=pattern-pi-mms-service-arm`

\*Register agent (org=demo)-
`oh deploy registerAgent --org demo`

Register agent with Policy
`oh deploy addPolicy`

## Complete guide to set up an agent on a brand new device running on Ubuntu 20.04

```
  - Run curl -sSL https://raw.githubusercontent.com/playground/hzn-cli/main/install.sh --output install.sh && bash ./install.sh
  - 1) Cli-And-Anax	      3) CLI-In-Container   5) Run-In-Containers  7) Confirm
    2) CLI-Only	      4) Anax-In-Container  6) All-In-One	  8) Quit
    Choose your environment setup: 1
  - Cli-And-Anax runs both CLI & Agent on host machine, choose <Confirm> to continue setup.
    Choose your environment setup: 7
  - You have chosen Cli-And-Anax
    1) Config-File
    2) Confirm
    3) Help
    4) Quit
    Continue with setup: 1
  - Please provide absolute path to configuration file, then choose <Confirm> to continue setup.
    example.json
    Continue with setup: 2

    The above selections will automate the setup process to install the agent and cli for you.

  - example.json template
    {
      "org": {
        "HZN_ORG_ID": "org-name",
        "HZN_DEVICE_TOKEN": "",
        "HZN_DEVICE_ID": "device-name",
        "HZN_EXCHANGE_USER_AUTH": "************",
        "HZN_EXCHANGE_URL": "http://xxx.xxx.xxx.xxx:3090/v1",
        "HZN_FSS_CSSURL": "http://xxx.xxx.xxx.xxx:9443/",
        "HZN_AGBOT_URL": "http://xxx.xxx.xxx.xxx:3111",
        "HZN_SDO_SVC_URL": "http://xxx.xxx.xxx.xxx:9008/api",
        "HZN_AGENT_PORT": "8510",
        "HZN_CSS": true,
        "CONFIG_CERT_PATH": "cert-file-with-absolute-path",
        "ANAX": "https://github.com/open-horizon/anax/releases/latest/download/agent-install.sh"
      },
      "service": {
        "SERVICE_NAME": "chunk-saved-model-service",
        "SERVICE_CONTAINER_NAME": "chunk-saved-model-service",
        "SERVICE_VERSION": "1.0.0",
        "SERVICE_VERSION_RANGE_UPPER": "1.0.0",
        "SERVICE_VERSION_RANGE_LOWER": "1.0.0",
        "SERVICE_CONTAINER_CREDS": "",
        "VOLUME_MOUNT": "/mms-shared",
        "MMS_SHARED_VOLUME": "mms_shared_volume",
        "MMS_OBJECT_TYPE": "chunk_object_detection",
        "MMS_OBJECT_ID": "chunk_config.json",
        "MMS_OBJECT_FILE": "config/config.json",
        "MMS_CONTAINER_CREDS": "",
        "MMS_CONTAINER_NAME": "chunk-mms-service",
        "MMS_SERVICE_NAME": "chunk-mms-service",
        "MMS_SERVICE_VERSION": "1.0.1",
        "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",
        "UPDATE_FILE_NAME": "model.zip"
      },
      "folders": [
        "/var/tmp/horizon/horizon1/fss-domain-socket",
        "/var/tmp/horizon/horizon1/ess-auth",
        "/var/tmp/horizon/horizon1/secrets",
        "/var/tmp/horizon/horizon1/nmp"
      ],
      "local": {
        "YOUR_DOCKERHUB_ID": "playbox21",
        "DOCKER_REGISTRY": "hub.docker.com",
        "DOCKER_TOKEN": "dckr_pat_wQJZTXR2WfGLohIHnqQylRMRIpk"
      },
      "anaxInContainer": "docker run -d -t --restart always --name horizon1 --privileged -p 127.0.0.1:8081:8510 -e DOCKER_NAME=horizon1 -e HZN_VAR_RUN_BASE=/var/tmp/horizon/horizon1 -v /var/run/docker.sock:/var/run/docker.sock -v /var/horizon:/etc/default/horizon:ro -v /var/agent-install.crt:/var/agent-install.crt -v horizon1_var:/var/horizon/ -v horizon1_etc:/etc/horizon/ -v /var/tmp/horizon/horizon1:/var/tmp/horizon/horizon1 openhorizon/amd64_anax:2.30.0-952",
      "cliInContainer": "docker run -d -it --restart always --name hzn-cli --privileged --network=\"host\" -v /var/run/docker.sock:/var/run/docker.sock -v /var/agent-install.crt:/var/agent-install.crt -e HORIZON_URL=http://localhost:8081 -e HZN_ORG_ID=${HZN_ORG_ID} -e HZN_EXCHANGE_USER_AUTH=${HZN_EXCHANGE_USER_AUTH} -e HZN_FSS_CSSURL=${HZN_FSS_CSSURL} -e HZN_EXCHANGE_URL=${HZN_EXCHANGE_URL} -e version=v2.30.0-952 playbox21/hzn-cli_amd64"
    }
```

## Complete guide to set up an Open Horizon Management Hub

```
  - oh deploy setupManagementHub

    _                                    _   _
  | |__    ____  _ __             ___  | | (_)
  | '_ \  |_  / | '_ \   _____   / __| | | | |
  | | | |  / /  | | | | |_____| | (__  | | | |
  |_| |_| /___| |_| |_|          \___| |_| |_|

  setupManagementHub biz
  [
    {
      name: 'HZN_LISTEN_IP',
      default: '127.0.0.1',
      ipList: [ '127.0.0.1', 'xxx.xxx.xxx.xxx' ],
      required: true
    },
    { name: 'HZN_TRANSPORT', default: 'https', required: true },
    { name: 'EXCHANGE_USER_ORG', default: 'myorg', required: true }
  ]

  Key in new value or (leave blank) press Enter to keep current value:
  prompt: HZN_LISTEN_IP:  (127.0.0.1) xxx.xxx.xxx.xxx  // external ip
  prompt: HZN_TRANSPORT:  (https) http
  prompt: EXCHANGE_USER_ORG:  (myorg) myhub
  {
    HZN_LISTEN_IP: 'xxx.xxx.xxx.xxx',
    HZN_TRANSPORT: 'https',
    EXCHANGE_USER_ORG: 'myhub'
  }

  Would you like to proceed to install Management Hub: Y/n?
  prompt: answer:  y
```
