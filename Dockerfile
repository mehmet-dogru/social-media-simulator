ARG NODE_VERSION=16.19.1
FROM node:${NODE_VERSION}-slim as base
WORKDIR /home/node/app
COPY v1/src /home/node/app/
RUN npm install
CMD npm run start
EXPOSE 3000