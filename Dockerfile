FROM node:22-alpine3.19

WORKDIR /application
COPY . /application/

RUN ./sys.sh

WORKDIR /home/user/application