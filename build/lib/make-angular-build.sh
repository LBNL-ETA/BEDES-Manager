#!/bin/bash

(cd /bedes-common && rm -rf node_modules && npm install)
(cd /app && rm -rf node_modules && npm install && ng build --prod=true --build-optimizer=true)

