include ../../.env

db_drop_all:
	cat db-drop.sql | \
	docker exec -i ${DB_CONTAINER_NAME} \
	psql -U postgres ${DB_NAME}

db_build_all:
	cat db-common.sql |  docker exec -i ${DB_CONTAINER_NAME} psql -U postgres ${DB_NAME}
	cat db-auth.sql |  docker exec -i ${DB_CONTAINER_NAME} psql -U postgres ${DB_NAME}
	cat db-build.sql |  docker exec -i ${DB_CONTAINER_NAME} psql -U postgres ${DB_NAME}

db_rebuild_all:
	make db_drop_all
	make db_build_all
