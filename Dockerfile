# Dockerfile for Heroku
# Backend
FROM node:10.16.3-alpine

USER root

ENV NPM_CONFIG_LOGLEVEL warn
RUN npm config set unsafe-perm true
RUN npm install -g @angular/cli@^7.0.4
# RUN apt-get update -y && apt-get install -y postgresql-client
RUN apk update && apk add postgresql-client && rm -rf /var/cache/apk/*

# bcrypt depencencies
# need this for node sass in alpine for bcrypt
RUN apk --no-cache add build-base python
RUN npm config set python /usr/bin/python

RUN mkdir -p /app
WORKDIR /app

COPY --chown=node:node bedes-frontend /app/bedes-frontend
COPY --chown=node:node bedes-backend /app/bedes-backend
COPY --chown=node:node bedes-common /app/bedes-common
COPY --chown=node:node ./build/lib/heroku-entrypoint.sh /entrypoint/heroku-entrypoint.sh

RUN chown -R node.node /app

USER node

RUN cd /app/bedes-common && npm install && cd /app/bedes-frontend && npm install

WORKDIR /app/bedes-backend
RUN rm -rf node_modules && npm install
# need this for node sass in alpine for bcrypt
RUN npm rebuild bcrypt --build-from-source

WORKDIR /app/bedes-frontend
RUN npm run build

CMD ["/entrypoint/heroku-entrypoint.sh"]
