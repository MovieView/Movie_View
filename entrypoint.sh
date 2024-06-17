#!/bin/sh

cd /home/user/application
/bin/sh test_env_gen.sh

su - user
cd /home/user/application

npm run start