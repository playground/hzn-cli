#!/bin/bash

ARCH=$(uname -m)
echo $ARCH
FILE="horizon-agent-linux-deb-amd64.tar.gz"
if [ "$ARCH" = "x86_64" ]
then
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
elif [ "$ARCH" = "armv7l" ]
then
 FILE="horizon-agent-linux-deb-armhf.tar.gz"
elif [ "$ARCH" = "arrch64" ]
then
 FILE="horizon-agent-linux-deb-arm64.tar.gz"
else
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
fi

curl -sSL https://raw.githubusercontent.com/open-horizon/anax/master/agent-install/agent-install.sh -o agent-install.sh

chmod 755 ./agent-install.sh

/bin/bash ./agent-install.sh -i "css:" --container
# if [ "${css}" = "true" ]
# then
#  ./agent-install.sh -i css: --container
# else
#  ./agent-install.sh --container
# fi

# oh deploy setup --org $org_id
#docker run -v /var/run/docker.sock:/var/run/docker.sock -ti docker
# echo "Docker login"
# read docker_user
# read -s -p "Password: " password
# docker login --username=$docker_user --password=$password

