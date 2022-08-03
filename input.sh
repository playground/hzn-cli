#!/bin/bash

echo "Input HZN_ORG_ID"
read org_id
export HZN_ORG_ID=${org_id}
echo "Input HZN_FSS_CSSURL"
read css_url
export HZN_FSS_CSSURL=${css_url}
echo "Input HZN_EXCHANGE_URL"
read exchange_url
export HZN_EXCHANGE_URL=${exchange_url}
echo "Input HZN_EXCHANGE_USER_AUTH"
read user_auth
export HZN_EXCHANGE_USER_AUTH=${user_auth}

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

curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
tar -zxvf ${FILE}
/bin/bash /oh/agent-install.sh -C

oh deploy setup --org myorg
#docker run -v /var/run/docker.sock:/var/run/docker.sock -ti docker
# echo "Docker login"
# read docker_user
# read -s -p "Password: " password
# docker login --username=$docker_user --password=$password

