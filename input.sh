#!/bin/bash

ARCH=$(uname -m)
echo $ARCH
FILE="horizon-agent-linux-deb-amd64.tar.gz"
if [ "${ARCH}" = "x86_64" ]
then
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
elif [ "${ARCH}" = "armv7l" ]
then
 FILE="horizon-agent-linux-deb-armhf.tar.gz"
elif [ "${ARCH}" = "aarch64" ]
then
 FILE="horizon-agent-linux-deb-arm64.tar.gz"
else
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
fi

BASEDIR=$(dirname $0)
echo ${BASEDIR}
cd ${BASEDIR}

echo ${version}
echo ${css}
if [ "${css}" = "true" ]
then
  ./agent-install.sh -i css: -C
elif [ "${version}" = "" ]
then 
  echo curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
  curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
  tar -zxvf ${FILE}
  ./agent-install.sh -C
else
  echo curl -sSL https://github.com/open-horizon/anax/releases/download/${version}/${FILE} -o ${FILE} 
  curl -sSL https://github.com/open-horizon/anax/releases/download/${version}/${FILE} -o ${FILE} 
  tar -zxvf ${FILE}
  ./agent-install.sh -C
fi

export HORIZON_URL="http://localhost:8081"
watch hzn agreement list    
# oh deploy setup --org $org_id
#docker run -v /var/run/docker.sock:/var/run/docker.sock -ti docker
# echo "Docker login"
# read docker_user
# read -s -p "Password: " password
# docker login --username=$docker_user --password=$password

