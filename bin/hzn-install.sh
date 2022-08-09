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

BASEDIR=$(dirname $0)
echo ${BASEDIR}
cd ${BASEDIR}
echo container ${container}
filename=""

echo "Input Version, leave blank to get latest:"
read version

echo ${version}
echo ${css}

if [ "${container}" = "true" ]
then
  echo "here..."
  curl -sSL https://raw.githubusercontent.com/open-horizon/anax/master/agent-install/agent-install.sh -o agent-install.sh && chmod +x agent-install.sh
  if [ "${css}" = "true" ]
  then
    sudo -s -E ./agent-install.sh -i css: --container
  elif [ "${version}" = "" ]
  then 
    curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
    tar -zxvf ${FILE}
    sudo -s -E ./agent-install.sh --container
  else
    curl -sSL https://github.com/open-horizon/anax/releases/download/v${version}/${FILE} -o ${FILE} 
    tar -zxvf ${FILE}
    sudo -s -E ./agent-install.sh --container
  fi
  rm agent-install.sh
else
  if [ "${css}" = "true" ]
  then
    ./agent-install.sh -i css: -C
  elif [ "${version}" = "" ]
  then 
    curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
    tar -zxvf ${FILE}
    ./agent-install.sh -C
  else
    curl -sSL https://github.com/open-horizon/anax/releases/download/v${version}/${FILE} -o ${FILE} 
    tar -zxvf ${FILE}
    ./agent-install.sh -C
  fi
  rm ${FILE}
  rm agent-install.sh
  filename="horizon-cli_"
  filename+=${version}
  filename+="_amd64.deb"
  rm ${filename} 
  filename="horizon_"
  filename+=${version}
  filename+="_amd64.deb"
  rm ${filename} 
fi


