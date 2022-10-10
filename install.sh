#!/bin/sh -i
set -e
# Install node and npm via nvm - https://github.com/nvm-sh/nvm

# Run this script like - bash script-name.sh

# Tested on Ubuntu, MacOS
# @playground
ENV_SETUP=""
CONFIG_FILE=""
PS3='Choose your environment setup: '
envsetup=("All-In-One" "CLI-Only" "Run-In-Container" "Confirm" "Quit")
select fav in "${envsetup[@]}"; do
	case $fav in
		"All-In-One")
			echo "$fav runs both CLI & Agent on host machine, choose <Confirm> to continue setup."
			ENV_SETUP=$fav
			# optionally call a function or run some code here
			;;
		"CLI-Only")
			echo "$fav runs CLI on host and Agent in container, choose <Confirm> to continue setup."
			ENV_SETUP=$fav
			# optionally call a function or run some code here
			;;
		"Run-In-Container")
			echo "$fav, CLI and Agent both runs in its own container, choose <Confirm> to continue setup."
			ENV_SETUP=$fav
			# optionally call a function or run some code here
			;;
		"Confirm")
			if [ "${ENV_SETUP}" = "" ]
			then
				echo "You have not chosen an env setup yet."
			else
				echo "You have chosen $ENV_SETUP"
				break
			fi
			# optionally call a function or run some code here
			;;
		"Quit")
	    echo "User requested exit"
	    exit
	    ;;
    *) echo "invalid option $REPLY";;
  esac
done

PS3='Continue with setup: '
configfile=("Config-File" "Confirm" "Help" "Quit")
select fav in "${configfile[@]}"; do
	case $fav in
		"Config-File")
			echo "Please provide absolute path to configuration file, then choose <Confirm> to continue setup."
			read CONFIG_FILE
			# optionally call a function or run some code here
			;;
		"Help")
			echo "You would need to provide your configuration json file with the following info."
			echo '\033[1;33m'
			echo '  {'
			echo '    "org": {'
    	echo '    "HZN_ORG_ID": "examples",'
			echo '    "HZN_DEVICE_TOKEN": "",'
			echo '    "HZN_DEVICE_ID": "device-name",'
			echo '    "HZN_EXCHANGE_USER_AUTH": "************",'
			echo '    "HZN_EXCHANGE_URL": "http://xxx.xxx.xxx.xxx:3090/v1",'
			echo '    "HZN_FSS_CSSURL": "http://xxx.xxx.xxx.xxx:9443/",'
			echo '    "HZN_AGBOT_URL": "http://xxx.xxx.xxx.xxx:3111",'
			echo '    "HZN_SDO_SVC_URL": "http://xxx.xxx.xxx.xxx:9008/api",'
			echo '    "HZN_AGENT_PORT": "8510",'
			echo '    "HZN_CSS": false,'
			echo '    "ANAX": "https://github.com/open-horizon/anax/releases/latest/download/agent-install.sh"'  
			echo '  },'
			echo '  "service": {'
			echo '    "SERVICE_NAME": "chunk-saved-model-service",'
			echo '    "SERVICE_CONTAINER_NAME": "chunk-saved-model-service",'
			echo '    "SERVICE_VERSION": "1.0.0",'
			echo '    "SERVICE_VERSION_RANGE_UPPER": "1.0.0",'
			echo '    "SERVICE_VERSION_RANGE_LOWER": "1.0.0",'
			echo '    "SERVICE_CONTAINER_CREDS": "",'
			echo '    "VOLUME_MOUNT": "/mms-shared",'
			echo '    "MMS_SHARED_VOLUME": "mms_shared_volume",'
			echo '    "MMS_OBJECT_TYPE": "chunk_object_detection",'
			echo '    "MMS_OBJECT_ID": "chunk_config.json",'
			echo '    "MMS_OBJECT_FILE": "config/config.json",'
			echo '    "MMS_CONTAINER_CREDS": "",'
			echo '    "MMS_CONTAINER_NAME": "chunk-mms-service",'
			echo '    "MMS_SERVICE_NAME": "chunk-mms-service",'
			echo '    "MMS_SERVICE_VERSION": "1.0.1",'
			echo '    "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",'
			echo '    "UPDATE_FILE_NAME": "model.zip"'
			echo '  }'
			echo '\033[0m'
			;;
		"Confirm")
			if [ "${CONFIG_FILE}" = "" ]
			then
				echo "You have not provided your configuration file."
			else
				echo "You have provided $CONFIG_FILE for this setup"
				break
			fi
			# optionally call a function or run some code here
			;;
		"Quit")
	    echo "User requested exit"
	    exit
	    ;;
    *) echo "invalid option $REPLY";;
  esac
done

if [ -d "${HOME}/.nvm/.git" ]
then echo "nvm installed"
	#echo -e "==> Update npm to latest version, if this stuck then terminate (CTRL+C) the execution"
	npm install -g npm

	echo "==> Checking for versions"
	nvm --version
	node --version
	npm --version

	echo "==> Print binary paths"
	which npm
	which node

	echo "==> List installed node versions"
	nvm ls

	nvm cache clear
	echo "==> Now you're all setup and ready for development. If changes are yet to take effect in the current shell, try source ~/.bashrc or open a new shell"

	echo "==> Installing oh cli"
	npm i -g hzn-cli

	echo "==> Checking oh version"
	oh --version

	echo "==> Setting up hzn environment..."
	if [ "${ENV_SETUP}" = "All-In-One" ]
	then
		echo "$ENV_SETUP, here we go."
		oh deploy autoSetupCliOnly --config_file ${CONFIG_FILE}
	elif [ "${ENV_SETUP}" = "CLI-Only" ]
	then
		echo "$ENV_SETUP, here we go."
		oh deploy autoSetupCliOnly --config_file ${CONFIG_FILE}
	elif [ "${ENV_SETUP}" = "Anax-In-Container" ]
	then
		echo "$ENV_SETUP, here we go."
	else
		echo "Something went wrong...$ENV_SETUP"
		break
	fi
else echo "nvm not installed"
	# Define versions
	INSTALL_NODE_VER=16
	INSTALL_NVM_VER=0.39.1

	# You can pass argument to this script --version 8
	if [ "$1" = '--version' ]; then
		echo "==> Using specified node version - $2"
		INSTALL_NODE_VER=$2
	fi

	echo "==> Ensuring .bashrc exists and is writable"
	touch ~/.bashrc

	echo "==> Installing node version manager (NVM). Version $INSTALL_NVM_VER"
	# Removed if already installed
	rm -rf ~/.nvm
	# Unset exported variable
	export NVM_DIR=

	# Install nvm 
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$INSTALL_NVM_VER/install.sh | bash
	# Make nvm command available to terminal
	source ~/.nvm/nvm.sh

	echo "==> Installing node js version $INSTALL_NODE_VER"
	nvm install $INSTALL_NODE_VER

	echo "==> Make this version system default"
	nvm alias default $INSTALL_NODE_VER
	nvm use default

fi
