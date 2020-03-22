#!/bin/bash
set -e

git fetch
if [ $? != 0 ]; then
    echo "get fetch failed ($exit_status)..." 1>&2
    exit $exit_status
fi
git pull
if [ $? != 0 ]; then
    echo "get pull failed ($exit_status)..." 1>&2
    exit $exit_status
fi
docker-compose down
if [ $? != 0 ]; then
    echo "compose-down failed ($exit_status)..." 1>&2
    exit $exit_status
fi
#sudo chown -R ubuntu.ubuntu . bedes-db/postgres_data/
#if [ $? != 0 ]; then
#    echo "chown failed ($exit_status)..." 1>&2
#    exit $exit_status
#fi
make build_ng_image
if [ $? != 0 ]; then
    echo "make angular failed ($exit_status)..." 1>&2
    exit $exit_status
fi
docker-compose build
if [ $? != 0 ]; then
    echo "docker-compose build failed ($exit_status)..." 1>&2
    exit $exit_status
fi
docker-compose up -d
if [ $? != 0 ]; then
    echo "docker-compose up failed ($exit_status)..." 1>&2
    exit $exit_status
fi
