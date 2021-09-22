# hzn-cli 

## IEAM / Open Horizon Toolkit
Open Horizon toolkit is a CLI built with Typescript for the NodeJS developers.  It is intended to help streamline the process of preparing & deploying applications/services for node agents and to provide a set of convient methods to perform various tasks between orgs environments. 

## This toolkit comes with the following convenient commnands


## Pre-release version of hzn-cli, howto?

For now, you can give it a test drive by cloning this repo

```git clone git@github.com:playground/hzn-cli.git```

cd into hzn-cli then run the following command to install it on your device, this will install hzn-cli and the command will be available globally.

NOTE:  Node version 12 or higher is required to be installed before running the following command

```npm run local```

After installlation run

```oh deploy -h```
```
Deploy <action> to Org <org>

Positionals:
  action                                                     [string] [required]

Options:
      --version     Show version number                                [boolean]
      --org         Organization to be deployed to                      [string]
      --configpath  Specify path to your configuration, default is ./config
                                                                        [string]
      --name        Name of service, pattern, policy & etc.             [string]
  -h, --help        Show help                                          [boolean]
```

## To execute any of the "oh" actions, .env-hzn.json config file is required

.env-hzn.json template
```
{
  "biz": 
  {
    "envVars": {
      "HZN_ORG_ID": "<HZN_ORG_ID>",
      "HZN_EXCHANGE_USER_AUTH": "<HZN_EXCHANGE_USER_AUTH>",
      "HZN_EXCHANGE_URL": "<HZN_EXCHANGE_URL>",
      "HZN_FSS_CSSURL": "<HZN_FSS_CSSURL>",  
      "SERVICE_NAME": "<YOUR_SERVICE_NAME>",
      "SERVICE_VERSION": "<YOUR_SERVICE_VERSION>",
      "SERVICE_CONTAINER_CREDS": "",
      "YOUR_DOCKERHUB_ID": "<YOUR_DOCKERHUB_ID>",
      "VOLUME_MOUNT": "<VOLUME_MOUNT>",
      "MMS_SHARED_VOLUME": "<MMS_SHARED_VOLUME>",
      "MMS_CONTAINER_CREDS": "",
      "MMS_SERVICE_NAME": "<MMS_SERVICE_NAME>",
      "MMS_SERVICE_VERSION": "<MMS_SERVICE_VERSION>",
      "MMS_OBJECT_TYPE": "<MMS_OBJECT_TYPE>",
      "MMS_OBJECT_ID": "<MMS_OBJECT_ID>",
      "MMS_OBJECT_FILE": "config/config.json",
      "UPDATE_FILE_NAME": "<UPDATE_FILE_NAME>"  
    },
    "metaVars": {
    }
  },
  "demo": 
  {
    "envVars": {
      "HZN_ORG_ID": "<HZN_ORG_ID>",
      "HZN_EXCHANGE_USER_AUTH": "<HZN_EXCHANGE_USER_AUTH>",
      "HZN_EXCHANGE_URL": "<HZN_EXCHANGE_URL>",
      "HZN_FSS_CSSURL": "<HZN_FSS_CSSURL>",  
      "SERVICE_NAME": "<YOUR_SERVICE_NAME>",
      "SERVICE_VERSION": "<YOUR_SERVICE_VERSION>",
      "SERVICE_CONTAINER_CREDS": "",
      "YOUR_DOCKERHUB_ID": "<YOUR_DOCKERHUB_ID>",
      "VOLUME_MOUNT": "<VOLUME_MOUNT>",
      "MMS_SHARED_VOLUME": "<MMS_SHARED_VOLUME>",
      "MMS_CONTAINER_CREDS": "",
      "MMS_SERVICE_NAME": "<MMS_SERVICE_NAME>",
      "MMS_SERVICE_VERSION": "<MMS_SERVICE_VERSION>",
      "MMS_OBJECT_TYPE": "<MMS_OBJECT_TYPE>",
      "MMS_OBJECT_ID": "<MMS_OBJECT_ID>",
      "MMS_OBJECT_FILE": "config/config.json",
      "UPDATE_FILE_NAME": "<UPDATE_FILE_NAME>"  
    },
    "metaVars": {
    }
  }
}
```

## After installation, you can test out the cli by running

```oh deploy test --configpath /home/pi/config```
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
```oh deploy buildServiceImage --configpath /home/pi/config```

Push service docker image
```oh deploy pushServiceImage --configpath /home/pi/config```

Publish service to management hub
```oh deploy publishService --configpath /home/pi/config```

Publish service pattern
```oh deploy publishPattern --configpath /home/pi/config```

Publish MMS service
```oh deploy publishMMSService --configpath /home/pi/config```

Publish MMS pattern
```oh deploy publishMMSPattern --configpath /home/pi/config```

*Register agent (org=demo)- 
```oh deploy registerAgent --configpath /home/pi/config --org demo```