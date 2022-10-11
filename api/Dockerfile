# PRODUCTION DOCKERFILE
# ---------------------
# This Dockerfile allows to build a Docker image of the NestJS application
# and based on a NodeJS 14 image. The multi-stage mechanism allows to build
# the application in a "builder" stage and then create a lightweight production
# image containing the required dependencies and the JS build files.
# 
# Dockerfile best practices
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/

FROM node:16.14.0 as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package.json /home/node/
RUN yarn global add rimraf
RUN cd /home/node/ yarn install --production=false


COPY . /home/node
RUN cd /home/node && yarn build

# ---
FROM jrottenberg/ffmpeg:5-scratch AS FFmpeg
FROM node:16.14.0-buster-slim

RUN apt-get update && apt-get install -y --no-install-recommends

#ENV NODE_ENV production
ENV NODE_ENV=${NODE_ENV}

USER node
WORKDIR /home/node

COPY --from=FFmpeg / /
COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/
RUN mkdir -p /home/node/tmp/
RUN mkdir -p /home/node/tmp/audio/
RUN mkdir -p /home/node/tmp/images/
RUN mkdir -p /home/node/tmp/video/

CMD ["node", "dist/main.js"]

HEALTHCHECK --interval=60s --timeout=20s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:9000 || kill 1