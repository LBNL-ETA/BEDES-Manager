
install_and_run:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker run --name ${DB_CONTAINER_NAME} \
			-e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
			-e PGDATA=/var/lib/postgresql/data/pgdata \
			-e DB_NAME=${DB_NAME} \
			-e DB_ADMIN_USER=${DB_ADMIN_USER} \
			-e DB_ADMIN_PASSWORD=${DB_ADMIN_PASSWORD} \
			-e DB_APP_USER=${DB_APP_USER} \
			-e DB_APP_PASSWORD=${DB_APP_PASSWORD} \
			-v ${PWD}/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d \
			-v ${PWD}/postgres_data:/var/lib/postgresql/data/pgdata \
			-v ${PWD}/logs:/logs \
			-p ${DB_PORT}:5432 \
			-d ${DB_IMAGE} -c logging_collector=on -c log_destination=stderr -c log_directory=/logs \
	)

run:
	( \
		set -o allexport; . ./.env; . ../.env; set +o allexport; \
		docker run --name ${DB_CONTAINER_NAME} \
			-e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
			-e PGDATA=/var/lib/postgresql/data/pgdata \
			-v ${PWD}/postgres_data:/var/lib/postgresql/data/pgdata \
			-v ${PWD}/logs:/logs \
			-p ${PG_PORT}:5432 \
			-d ${DB_IMAGE} -c logging_collector=on -c log_destination=stderr -c log_directory=/logs \
	)

stop:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker stop ${DB_CONTAINER_NAME} \
	)

start:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker start ${DB_CONTAINER_NAME} \
	)

remove:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker rm ${DB_CONTAINER_NAME} \
	)

stop_and_remove:
	(
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		make stop \
		make remove \
	)

docker_logs:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker logs ${DB_CONTAINER_NAME} \
	)

psql:
	( \
		set -o allexport && . ./.env && . ../.env && set +o allexport && \
		docker exec -ti ${DB_CONTAINER_NAME} psql -Upostgres ${PG_DB_NAME} \
	)
