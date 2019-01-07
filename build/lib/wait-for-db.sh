# wait-for-postgres.sh

set -e

# host="$1"
# shift
cmd="$@"

echo "next cmd is $@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd