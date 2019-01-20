#!/bin/bash
set -e

# host="$1"
# shift
# cmd="$@"
# cmd="npm start"

# echo "next cmd is $@"
cmd="npm start"

echo "Waiting for Postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up, running node"
exec $cmd