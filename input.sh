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

if [ "${css}" = "true" ]
then
 ./agent-install.sh -i css: -C
else
  curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
  tar -zxvf ${FILE}
 ./agent-install.sh -C
fi

export HORIZON_URL=http://horizon1:8510
watch hzn agreement list    
# oh deploy setup --org $org_id
#docker run -v /var/run/docker.sock:/var/run/docker.sock -ti docker
# echo "Docker login"
# read docker_user
# read -s -p "Password: " password
# docker login --username=$docker_user --password=$password

