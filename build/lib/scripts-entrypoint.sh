#!/bin/bash
set -e

cmd="npm run load-all"

echo "Waiting for Postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up, running node"

NUM_RECS=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U postgres -A -t -c "select count(*) from bedes_term" bedes | tr -dc '0123456789')
# echo "num recs = ${NUM_RECS}"
# if ["${NUM_RECS}" = "0"]; then
#   echo "no recs... load terms"
#   exec $cmd
# else
#   echo "bedes_terms has ${NUM_RECS} records"
# fi
ZERO="0"
echo "'${NUM_RECS}' records found in public.bedes_term"
if [ "${NUM_RECS}" -eq "${ZERO}" ]; then
  echo "Load the BEDES terms..."
  exec $cmd
else
  echo "BEDES terms already loaded."
fi
