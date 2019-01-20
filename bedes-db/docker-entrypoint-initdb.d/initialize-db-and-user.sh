#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER ${DB_ADMIN_USER} with encrypted password '${DB_ADMIN_PASSWORD}';
    CREATE USER ${DB_APP_USER} with encrypted password '${DB_APP_PASSWORD}';
    CREATE DATABASE ${DB_NAME};
    GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_ADMIN_USER};
    ALTER DATABASE ${DB_NAME} OWNER TO ${DB_ADMIN_USER};
EOSQL

cat /create-epb-db/db-common.sql |  psql -U ${DB_ADMIN_USER} ${DB_NAME}
cat /create-epb-db/db-auth.sql |  psql -U ${DB_ADMIN_USER} ${DB_NAME}
cat /create-epb-db/db-build.sql | psql -U ${DB_ADMIN_USER} ${DB_NAME}