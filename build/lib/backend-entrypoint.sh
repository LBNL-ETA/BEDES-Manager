#!/bin/sh
set -e

cmd="npm run run-compose"

echo "Waiting for Postgres..."

# Heroku mode
if test -n ${DATABASE_URL}; then
  until psql "$DATABASE_URL" -c '\q'; do
    echo >&2 "Postgres is unavailable - sleeping (Heroku mode)"
    sleep 2
  done
# Docker Compose mode
else
  until PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -U postgres -c '\q'; do
    echo >&2 "Postgres is unavailable - sleeping (Docker Compose mode)"
    sleep 2
  done
fi

echo >&2 "Postgres is up, running node"
exec $cmd
