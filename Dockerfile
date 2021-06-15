# Dockerfile for Heroku
# Backend
FROM node:10.24.1-alpine

USER root

ENV NPM_CONFIG_LOGLEVEL warn
RUN npm config set unsafe-perm true
RUN npm install -g @angular/cli@^7.0.4 npm@^6
RUN apk update && apk add postgresql-client && apk add bash && apk add curl && apk add openssh && rm -rf /var/cache/apk/*

# bcrypt depencencies
# need this for node sass in alpine for bcrypt
RUN apk --no-cache add build-base python
RUN npm config set python /usr/bin/python

RUN mkdir -p /app
WORKDIR /app

COPY --chown=node:node bedes-frontend /app/bedes-frontend
COPY --chown=node:node bedes-backend /app/bedes-backend
COPY --chown=node:node bedes-common /app/bedes-common
COPY --chown=node:node scripts /app/scripts
COPY --chown=node:node ./server.js /app/server.js
COPY --chown=node:node ./package*.json /app/
COPY --chown=node:node ./build/lib/heroku-entrypoint.sh /entrypoint/heroku-entrypoint.sh

RUN chown -R node.node /app

USER node

RUN npm i --production

WORKDIR /app/bedes-common
RUN rm -rf node_modules && npm i

WORKDIR /app/bedes-frontend
RUN rm -rf node_modules && npm i

WORKDIR /app/scripts/ts
RUN rm -rf node_modules && npm i

WORKDIR /app/bedes-backend
RUN rm -rf node_modules && npm i
# need this for node sass in alpine for bcrypt
RUN npm rebuild bcrypt --build-from-source
RUN npm run build-production

# Reinstall dependencies in production mode.
COPY bedes-backend/package*.json /app/bedes-backend/dist/bedes-backend/
WORKDIR /app/bedes-backend/dist
RUN rm -rf node_modules && npm i --production


WORKDIR /app/bedes-frontend
RUN rm -rf node_modules && npm i
# Build Angular.
RUN npm run build

USER root
# Ensure Heroku Exec compatibility.
ADD ./build/.profile.d /app/.profile.d
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

USER node
WORKDIR /app
RUN mkdir /app/bedes-mappings
COPY bedes-mappings /app/bedes-mappings

CMD ["/entrypoint/heroku-entrypoint.sh"]
