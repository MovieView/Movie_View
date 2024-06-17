#!/bin/sh

set -euo pipefail

apk -U update
apk -U upgrade

rm -rf /var/cache/apk/*

adduser -D user

npm install -g npm@latest
npm install && npm cache clean --force

npm run build

cp -r /application/ /home/user
rm -r /application/*

chown user: /home/user/application/*