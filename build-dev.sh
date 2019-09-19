#!/bin/bash
set -e

# load environment variables into script
set -o allexport
. ./environment/postgres.env
. ./environment/backend.env
. ./environment/docker.env
set +o allexport

# check env variables
if [ -z "${DB_CONTAINER_NAME}" ]; then
    echo "Database container name not set, set DB_CONTAINER_NAME in docker.env"
    exit 1
fi
if [ -z "${DB_PASSWORD}" ]; then
    echo "Database admin not set, set DB_PASSWORD in backend.env"
    exit 1
fi
if [ -z "${BEDES_ADMIN_PASSWORD}" ]; then
    echo "bedes admin not set, set BEDES_ADMIN_PASSWORD in backend.env"
    exit 1
fi

# stop and remove the db container if it's running
if (docker ps | grep -s ${DB_CONTAINER_NAME}); then
    echo "Main database is running... stop and remove"
    docker stop ${DB_CONTAINER_NAME}
    docker rm ${DB_CONTAINER_NAME}
fi

# remove the volume if it's there
if (docker volume ls | grep -s ${POSTGRES_VOLUME_NAME}); then
    echo "Main database is running... stop and remove"
    docker volume rm ${POSTGRES_VOLUME_NAME}
fi

# create the new volume
docker volume create ${POSTGRES_VOLUME_NAME}

# build the database
(cd bedes-db && make run)

# wait for a few seconds for the database to build
echo "Wait for database..."
sleep 10

# Load the initial set of bedes terms
(cd scripts/ts && npm run load-all)

# build the db admin user
(cd scripts/ts && npm run add-bedes-admin-user)

# build test users
(cd scripts/ts && npm run add-bedes-test-users)
