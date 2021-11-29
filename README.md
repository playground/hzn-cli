# hzn-cli 

## IEAM / Open Horizon Toolkit
Open Horizon toolkit is a CLI built with Typescript for the NodeJS developers.  It is intended to help streamline the process of preparing & deploying applications/services for node agents and to provide a set of convient methods to perform various tasks between orgs environments. 

## This toolkit comes with the following convenient commnands


## Pre-release version of hzn-cli, howto?

```npm i -g hzn-cli```

After installlation run

```oh deploy -h```
```
Deploy <action> to Org <org>

Positionals:
  action  Available actions: allInOneMMS, buildMMSImage, buildServiceImage,
          checkConfigState, createHznKey, dockerImageExists, getDeviceArch,
          listDeploymentPolicy, listNode, listNodePattern, listObject,
          listPattern, listService, publishMMSObject, publishMMSPattern,
          publishMMSService, publishPatterrn, publishService, pullDockerImage,
          pushMMSImage, pushServiceImage, registerAgent, setup, showHznInfo,
          test, uninstallHorizon, unregisterAgent, updateHznInfo
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