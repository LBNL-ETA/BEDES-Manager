#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER ${DB_USER} with encrypted password '${DB_PASSWORD}';
    CREATE DATABASE ${DB_NAME};
    GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
    ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOSQL

echo "build the tables..."

echo " build db-common"
psql -U ${DB_USER} \
     --single-transaction \
    --echo-all \
    --set ON_ERROR_STOP=on \
    -f /create-epb-db/db-common.sql \
    ${DB_NAME}

echo "done = $?"

echo "build eb-auth..."
psql -U ${DB_USER} \
     --single-transaction \
    --echo-all \
    --set ON_ERROR_STOP=on \
    -f /create-epb-db/db-auth.sql \
    ${DB_NAME}

echo "done = $?"

echo "build db-build..."
psql -U ${DB_USER} \
     --single-transaction \
    --echo-all \
    --set ON_ERROR_STOP=on \
    -f /create-epb-db/db-build.sql \
    ${DB_NAME}

echo "done = $?"
