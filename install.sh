#!/bin/sh -i
set -e
# Install node and npm via nvm - https://github.com/nvm-sh/nvm

# Run this script like - bash script-name.sh

# Tested on Ubuntu, MacOS
# @playground

if [[ $OSTYPE == 'darwin'* ]]
then
	echo 'MacOS'
	which -s brew
	if [[ $? != 0 ]]
	then
		# Install Homebrew
		ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	fi
	brew install socat jq
else
	echo "Update and install jq"
	sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get install jq
fi

ensure_dialog_installed() {
    if ! command -v dialog &> /dev/null; then
        echo "dialog could not be found, attempting to install..."

        # Detect the package manager and install dialog
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y dialog
            elif command -v yum &> /dev/null; then
                sudo yum install -y dialog
            else
                echo "No compatible package manager found. Please install dialog manually."
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # Assume Homebrew is installed on macOS
            if command -v brew &> /dev/null; then
                brew install dialog
            else
                echo "Homebrew is not installed. Please install Homebrew and dialog manually."
                exit 1
            fi
        else
            echo "Unsupported OS. Please install dialog manually."
            exit 1
        fi
    else
        echo "dialog is already installed."
    fi
}

ensure_dialog_installed

ENV_SETUP=""
CONFIG_FILE=""
K8S_SETUP=""
PS3='Choose your environment setup: '
ENV_SETUP_OPTIONS=("Run-In-Containers" "All-In-One" "OH-Mesh" "Quit")

# Create a dialog box
CHOICE=$(dialog --colors --clear --no-shadow \
--backtitle "Setup Configuration" \
--title "\Zb\Z1Choose Your Environment Setup" \
--menu "\n\Zb\Z3Select an option:" 15 60 5 \
"1" "Run-In-Containers" \
"2" "All-In-One" \
"3" "OH-Mesh" \
"4" "Quit" \
3>&1 1>&2 2>&3)

case $CHOICE in
    1)
        ENV_SETUP="Run-In-Containers"
        #echo "$ENV_SETUP, Runs both CLI and Agent in its own container, choose <Confirm> to continue setup."
        ;;
    2)
        ENV_SETUP="All-In-One"
        #echo "$ENV_SETUP, Runs CLI, Agent & Management Hub on the same machine, choose <Confirm> to continue setup."
        ;;
    3)
        ENV_SETUP="OH-Mesh"
       # echo "$ENV_SETUP, Set up OH Agent with Mesh, choose <Confirm> to continue setup."
        ;;
    4)
       # echo "User requested exit"
        exit
        ;;
    *)
       # echo "Invalid option, exiting."
        exit 1
        ;;
esac

if [ "${ENV_SETUP}" = "OH-Mesh" ]
then
    # Use dialog to create a menu for Kubernetes setup
    K8S_SETUP=$(dialog --colors --clear --no-shadow \
    --backtitle "Kubernetes Setup" \
    --title "\Zb\Z1Choose Kubernetes Setup for OH Agent with Mesh" \
    --menu "\n\Zb\Z3Select Kubernetes setup:" 15 60 4 \
    "None" "Kube is already setup" \
    "K3S" "Setup K3S for OH Agent with Mesh" \
    "K8S" "Setup K8S for OH Agent with Mesh" \
    "Confirm" "Confirm your selection" \
    "Quit" "Exit setup" \
    3>&1 1>&2 2>&3)

    case $K8S_SETUP in
        "None")
            echo "Kube is already setup."
            K8S_SETUP="None"
            ;;
        "K3S")
            echo "Setup K3S for OH Agent with Mesh, choose <Confirm> to continue setup."
            K8S_SETUP="K3S"
            ;;
        "K8S")
            echo "Setup K8S for OH Agent with Mesh, choose <Confirm> to continue setup."
            K8S_SETUP="K8S"
            ;;
        "Confirm")
            echo "You have chosen $K8S_SETUP for your setup."
            ;;
        "Quit")
            echo "User requested exit"
            exit
            ;;
        *)
            echo "Invalid option, exiting."
            exit 1
            ;;
    esac
fi

PS3='Continue with setup: '
configfile=("Config-File" "Confirm" "Help" "Quit")

while true; do

CHOICE=$(dialog --colors --clear --no-shadow \
--backtitle "Configuration File Setup" \
--title "\Zb\Z1Configuration Options" \
--menu "\n\Zb\Z3Select an option:" 15 60 4 \
"Config-File" "Provide configuration file path" \
"Confirm" "Confirm the provided configuration file" \
"Help" "Get help on what needs to be in the configuration file" \
"Quit" "Exit setup" \
3>&1 1>&2 2>&3)
case $CHOICE in
"Config-File")
    CONFIG_FILE=$(dialog --title "Configuration File" --inputbox "Enter the absolute path to your configuration file:" 8 60 3>&1 1>&2 2>&3)
    if [ "$?" -eq 1 ]; then
        echo "User cancelled the input."
    elif [ -z "$CONFIG_FILE" ]; then
        dialog --title "Error" --msgbox "No path provided. Please provide a valid path." 5 50
    else
        dialog --title "File Provided" --msgbox "You have provided $CONFIG_FILE" 5 50
        fi
        ;;
    "Confirm")
        if [ -z "${CONFIG_FILE}" ]; then
            dialog --title "Error" --msgbox "You have not provided your configuration file." 5 50
        else
            dialog --title "File Provided" --msgbox "You have provided $CONFIG_FILE for this setup" 5 50
            break
        fi
        ;;
		"Help")
        dialog --title "Configuration Help" --msgbox "You would need to provide your configuration json file with the following info:\n\n{
  \"org\": {
    \"HZN_ORG_ID\": \"examples\",
    \"HZN_DEVICE_TOKEN\": \"\",
    \"HZN_DEVICE_ID\": \"device-name\",
    \"HZN_EXCHANGE_USER_AUTH\": \"************\",
    \"HZN_EXCHANGE_URL\": \"http://xxx.xxx.xxx.xxx:3090/v1\",
    \"HZN_FSS_CSSURL\": \"http://xxx.xxx.xxx.xxx:9443/\",
    \"HZN_AGBOT_URL\": \"http://xxx.xxx.xxx.xxx:3111\",
    \"HZN_SDO_SVC_URL\": \"http://xxx.xxx.xxx.xxx:9008/api\",
    \"HZN_AGENT_PORT\": \"8510\",
    \"HZN_CSS\": false,
    \"ANAX\": \"https://github.com/open-horizon/anax/releases/latest/download/agent-install.sh\"
  },
  \"service\": {
    \"SERVICE_NAME\": \"chunk-saved-model-service\",
    \"SERVICE_CONTAINER_NAME\": \"chunk-saved-model-service\",
    \"SERVICE_VERSION\": \"1.0.0\",
    \"SERVICE_VERSION_RANGE_UPPER\": \"1.0.0\",
    \"SERVICE_VERSION_RANGE_LOWER\": \"1.0.0\",
    \"SERVICE_CONTAINER_CREDS\": \"\",
    \"VOLUME_MOUNT\": \"/mms-shared\",
    \"MMS_SHARED_VOLUME\": \"mms_shared_volume\",
    \"MMS_OBJECT_TYPE\": \"chunk_object_detection\",
    \"MMS_OBJECT_ID\": \"chunk_config.json\",
    \"MMS_OBJECT_FILE\": \"config/config.json\",
    \"MMS_CONTAINER_CREDS\": \"\",
    \"MMS_CONTAINER_NAME\": \"chunk-mms-service\",
    \"MMS_SERVICE_NAME\": \"chunk-mms-service\",
    \"MMS_SERVICE_VERSION\": \"1.0.1\",
    \"MMS_SERVICE_FALLBACK_VERSION\": \"1.0.0\",
    \"UPDATE_FILE_NAME\": \"model.zip\"
  },
  \"folders\": [
    \"/var/tmp/horizon/horizon1/fss-domain-socket\",
    \"/var/tmp/horizon/horizon1/ess-auth\",
    \"/var/tmp/horizon/horizon1/secrets\",
    \"/var/tmp/horizon/horizon1/nmp\"
  ],
  \"local\": {
    \"YOUR_DOCKERHUB_ID\": \"dockerid\",
    \"DOCKER_REGISTRY\": \"hub.docker.com\",
    \"DOCKER_TOKEN\": \"dckr_pat_w......\"
  },
  \"anaxInContainer\": \"docker run -d -t --restart always --name horizon1 --privileged -p 127.0.0.1:8081:8510 -e DOCKER_NAME=horizon1 -e HZN_VAR_RUN_BASE=/var/tmp/horizon/horizon1 -v /var/run/docker.sock:/var/run/docker.sock -v /var/horizon:/etc/default/horizon:ro -v /var/agent-install.crt:/var/agent-install.crt -v horizon1_var:/var/horizon/ -v horizon1_etc:/etc/horizon/ -v /var/tmp/horizon/horizon1:/var/tmp/horizon/horizon1 openhorizon/amd64_anax:2.30.0-952\",
  \"cliInContainer\": \"docker run -d -it --restart always --name hzn-cli --privileged --network=\\\"host\\\" -v /var/run/docker.sock:/var/run/docker.sock -v /var/agent-install.crt:/var/agent-install.crt -e HORIZON_URL=http://localhost:8081 -e HZN_ORG_ID=${HZN_ORG_ID} -e HZN_EXCHANGE_USER_AUTH=${HZN_EXCHANGE_USER_AUTH} -e HZN_FSS_CSSURL=${HZN_FSS_CSSURL} -e HZN_EXCHANGE_URL=${HZN_EXCHANGE_URL} -e version=v2.30.0-952 playbox21/hzn-cli_amd64\"
}" 22 70
			;;
		"Quit")
	    echo "User requested exit"
	    exit
	    ;;
    *)  dialog --title "Invalid Option" --msgbox "Invalid option, exiting." 5 50
        exit 1
        ;;
  esac
done

if [[ -f "${HOME}/.nvm/nvm.sh" ]]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
else echo "nvm not installed"
	# Define versions
	INSTALL_NODE_VER=20
	INSTALL_NVM_VER=0.39.5

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

	echo "==> Checking for versions"
	nvm --version

	echo "==> List installed node versions"
	nvm ls

	nvm cache clear
	echo "==> Now you're all setup and ready for development. If changes are yet to take effect in the current shell, try source ~/.bashrc or open a new shell"

fi

echo "==> Print binary paths"
which npm
which node

echo "==> Checking for versions"
node --version
npm --version

echo -e "==> Update npm to latest version, if this stuck then terminate (CTRL+C) the execution"
npm install -g npm

if [ "$1" = "--skip-hzn-cli" ] 
then
	echo "==> Skipping oh cli installation"
else
	echo "==> Installing oh cli"
	npm i -g hzn-cli
fi

echo "==> Checking oh version"
oh --version

echo "==> Setting up hzn environment..."
sudo touch /etc/default/horizon

if [ "${ENV_SETUP}" = "Cli-And-Anax" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetup --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "CLI-Only" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupCliOnly --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "CLI-In-Container" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupCliInContainer --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "Anax-In-Container" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupAnaxInContainer --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "Run-In-Containers" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupContainer --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "All-In-One" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupAllInOne --config_file ${CONFIG_FILE}
elif [ "${ENV_SETUP}" = "OH-Mesh" ]
then
	echo "$ENV_SETUP, here we go."
	oh deploy autoSetupOpenHorizonMesh --config_file ${CONFIG_FILE} --k8s ${K8S_SETUP}
else
	echo "Something went wrong...$ENV_SETUP"
	break
fi
