# hzn-cli 

## IEAM / Open Horizon Toolkit
Open Horizon toolkit is a CLI built with Typescript for the NodeJS developers.  It is intended to help streamline the process of preparing & deploying applications/services for node agents and to provide a set of convient methods to perform various tasks between orgs environments. 

## This toolkit comes with the following convenient commnands

## A complete guide is available below

## Pre-release version of hzn-cli, howto?

### To setup Management Hub
```curl -sSL https://raw.githubusercontent.com/playground/hzn-cli/main/install-mgmt-hub.sh  --output install-mgmt-hub.sh && bash ./install-mgmt-hub.sh```

### To setup Edge Node Agent
```curl -sSL https://raw.githubusercontent.com/playground/hzn-cli/main/install.sh  --output install.sh && bash ./install.sh```

OR

```npm i -g hzn-cli```

After installlation run

```oh deploy -h```
```
Deploy <action> to Org <org>

Positionals:
  action  Available actions: buildAndPublish, buildMMSImage,
          buildPublishAndRegister, buildServiceImage, checkConfigState,
          createHznKey, dockerImageExists, getDeviceArch, getIpAddress,
          listDeploymentPolicy, listNode, listNodePattern, listObject,
          listPattern, listService, publishAndRegister, publishMMSObject,
          publishMMSPattern, publishMMSService, publishPatterrn, publishService,
          publishServiceAndPattern, pullDockerImage, pushMMSImage,
          pushServiceImage, registerAgent, removeOrg, setup, setupManagementHub,
          showHznInfo, test, uninstallHorizon, unregisterAgent, updateHznInfo
                                                             [string] [required]

Options:
      --version             Show version number                        [boolean]
      --org                 Organization to be deployed to              [string]
      --config_path         Specify path to your configuration, default is
                            ./config                                    [string]
      --name                Name of service, pattern, policy & etc.     [string]
      --object_type         Type of object                              [string]
      --object_id           Id of object to be published                [string]
      --object              Object file to be published                 [string]
      --pattern             MMS pattern                                 [string]
      --skip_config_update  Do not prompt for config updates            [string]
  -h, --help                Show help                                  [boolean]
```
## To setup your environment, you will need to run
```oh deploy setup```

This will prompt you for your credential, Docker Hub Id & other configuration parameters.
This will also install and setup hzn envirnoment for you if it hasn't been installled.

## To execute any of the "oh" actions
```oh deploy <action>, for example: oh deploy registerAgent```

## After installation and initialization, you can test out the cli by running

```oh deploy test```
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
```oh deploy buildServiceImage```

Push service docker image
```oh deploy pushServiceImage```

Publish service to management hub
```oh deploy publishService```

Publish service pattern
```oh deploy publishPattern```

Publish MMS service
```oh deploy publishMMSService```

Publish MMS pattern and specify path to the policy.json
```oh deploy publishMMSPattern --config_path /home/pi/config```

Publish MMS Object file
```oh deploy publishMMSObject --object_type=object_detection --object_id=config.json --object=/Users/jeff/Downloads/demo-model/demo/version1/model.zip --pattern=pattern-pi-mms-service-arm```

*Register agent (org=demo)- 
```oh deploy registerAgent --org demo```

## Complete guide to set up an agent on a brand new device running on Ubuntu 20.04
```
  - sudo apt-get update && sudo apt-get upgrade
  - sudo apt install npm -y"
  - sudo npm install -g n && sudo n stable
  - open a new shell or run PATH="$PATH"
  - node -v should return the latest stable version, currently at v16.13.1
  - sudo npm i -g hzn-cli
  - oh --version should return v0.1.8
  - run "oh deploy setup"
    - No config files. Initialising...

    - Key in new value or press Enter to keep current value: 
    - prompt: YOUR_DOCKERHUB_ID:  playbox21
    - prompt: HZN_EXCHANGE_USER_AUTH:  iamapikey:**************************
    - prompt: HZN_EXCHANGE_URL:  (https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-exchange/v1) 
    - prompt: HZN_FSS_CSSURL:  (https://cp-console.ieam42-edge-8e873dd4c685acf6fd2f13f4cdfb05bb-0000.us-south.containers.appdomain.cloud/edge-css) 
    - prompt: HZN_CUSTOM_NODE_ID:  (knap1.fyre.ibm.com) 

    - Would you like to change any of the above properties for biz: Y/n?
    - prompt: answer:  Y

    - Key in new value or press Enter to keep current value: 
    - prompt: SERVICE_NAME:  (saved-model-service) saved-model-service-aws
    - prompt: SERVICE_CONTAINER_NAME:  (saved-model-service) saved-model-service-aws
    - prompt: SERVICE_VERSION:  (1.0.0) 1.0.9
    - prompt: SERVICE_CONTAINER_CREDS:  
    - prompt: VOLUME_MOUNT:  (/mms-shared) 
    - prompt: MMS_SHARED_VOLUME:  (demo_model_mms_helper_shared_volume) 
    - prompt: MMS_CONTAINER_CREDS:  
    - prompt: MMS_CONTAINER_NAME:  (mms-service) mms-service-aws
    - prompt: MMS_SERVICE_NAME:  (mms-service) mms-service-aws
    - prompt: MMS_SERVICE_VERSION:  (1.0.0) 1.0.9
    - prompt: MMS_OBJECT_TYPE:  (object_detection) 
    - prompt: MMS_OBJECT_ID:  (config.json) 
    - prompt: MMS_OBJECT_FILE:  (config/config.json) 
    - prompt: UPDATE_FILE_NAME:  (model.zip)

    - Would you like to save these changes: Y/n?
    - prompt: answer:  Y
    - sudo mv .env-hzn.json /etc/default/config/.env-hzn.json
    - command executed successfully
    - config files updated for biz
    - failed to identify arch
    - Command failed: hzn architecture
    - /bin/sh: 1: hzn: not found

    - need to install hzn, this will install and setup hzn environment if it doesn't exist
  should see this message when it's done
  command executed successfully
  done installing hzn cli.

  it works...undefined, your environment is ready to go!
  process completed.

  - run "oh deploy registerAgent" or "oh deploy registerAgent --skip_config_update"
  will prompt to make changes to configuration as needed or answer n to proceed 
  will attempt to unregister then register agent with the provided configurations
  if all goes well, agent should start up shortly
  http://<ip-to-device>:3000/ is now up and running
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
  prompt: HZN_TRANSPORT:  (https) 
  prompt: EXCHANGE_USER_ORG:  (myorg) myhub
  {
    HZN_LISTEN_IP: 'xxx.xxx.xxx.xxx',
    HZN_TRANSPORT: 'https',
    EXCHANGE_USER_ORG: 'myhub'
  }

  Would you like to proceed to install Management Hub: Y/n?
  prompt: answer:  y
```  
