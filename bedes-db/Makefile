include ../environment/backend.env
include ../environment/postgres.env
include ../environment/docker.env

run:
	docker run --name ${DB_CONTAINER_NAME} \
		-e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
		-e PGDATA=/var/lib/postgresql/data/pgdata \
		-e DB_NAME=${DB_NAME} \
		-e DB_ADMIN_USER=${DB_ADMIN_USER} \
		-e DB_ADMIN_PASSWORD=${DB_ADMIN_PASSWORD} \
		-e DB_APP_USER=${DB_APP_USER} \
		-e DB_APP_PASSWORD=${DB_APP_PASSWORD} \
		-v ${PWD}/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d \
		-v ${POSTGRES_VOLUME_NAME}:/var/lib/postgresql/data/pgdata \
		-v ${PWD}/../scripts/db:/create-epb-db \
		-p ${DB_PORT}:5432 \
		-d ${DB_IMAGE}

stop:
	docker stop ${DB_CONTAINER_NAME}

start:
	docker start ${DB_CONTAINER_NAME}

remove:
	docker rm ${DB_CONTAINER_NAME}

stop_and_remove:
		make stop
		make remove

docker_logs:
	docker logs ${DB_CONTAINER_NAME}

psql:
	docker exec -ti ${DB_CONTAINER_NAME} psql -Upostgres ${PG_DB_NAME}

volume_create:
	docker volume create ${POSTGRES_VOLUME_NAME}

volume_rm:
	docker volume rm ${POSTGRES_VOLUME_NAME}
