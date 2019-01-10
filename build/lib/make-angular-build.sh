#!/bin/bash

(cd /app && rm -rf node_modules && npm install)
(cd /bedes-common && rm -rf node_modules && npm install)
(cd /app && ng build --prod=true --build-optimizer=true)
