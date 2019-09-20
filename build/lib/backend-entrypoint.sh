#!/bin/sh
set -e

cmd="npm run run-compose"

echo "Waiting for Postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up, running node"
exec $cmd