FROM node:lts-alpine

WORKDIR /app

COPY index.js .
COPY package.json .
COPY ./lib ./lib

RUN npm install -g
