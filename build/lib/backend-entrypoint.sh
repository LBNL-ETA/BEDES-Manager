#!/bin/bash
set -e

cmd="npm start"

echo "Waiting for Postgres..."
until PGPASSWORD=$PG_PASS psql -h $PG_CONTAINER_HOST -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up, running node"
exec $cmd