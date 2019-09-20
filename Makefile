include .env

init_docker:
	make build_ng_image
	make build_scripts_image
	make volume_create

# build the angular builder
build_ng_image:
	docker build \
		-t ${ANGULAR_BUILD_IMAGE} \
		-f ./build/Dockerfiles/Dockerfile-angular \
		--rm=true \
		.

# build the script runner image
build_scripts_image:
	docker build \
		-t ${SCRIPT_IMAGE} \
		-f ./build/Dockerfiles/Dockerfile-scripts \
		--rm=true \
		.

# run all initialization scripts
run_scripts_data_init:
	make run_scripts_load_data
	make run_scripts_add_bedes_admin_user
	make run_scripts_add_bedes_test_users

# load an initial set of bedes-terms
run_scripts_load_data:
	docker run \
		--network=${DOCKER_NET_NAME} \
		--env-file=.env \
		--rm \
		--name=${SCRIPT_CONTAINER} \
		${SCRIPT_IMAGE} \
		load-all-compose

# create the bedes-admin account
run_scripts_add_bedes_admin_user:
	docker run \
		--network=${DOCKER_NET_NAME} \
		--env-file=.env \
		--rm \
		--name=${SCRIPT_CONTAINER} \
		${SCRIPT_IMAGE} \
		add-bedes-admin-user

# create the bedes test-user accounts
run_scripts_add_bedes_test_users:
	docker run \
		--network=${DOCKER_NET_NAME} \
		--env-file=.env \
		--rm \
		--name=${SCRIPT_CONTAINER} \
		${SCRIPT_IMAGE} \
		add-bedes-test-users

# create the database volume
volume_create:
	docker volume create ${POSTGRES_VOLUME_NAME}

# remove the database volume
volume_rm:
	docker volume rm ${POSTGRES_VOLUME_NAME}

dev-clean-data:
	make volume_rm
	make volume_create
	(cd bedes-db && make run && sleep 10)
	(cd scripts/ts && npm run load-all && npm run add-bedes-admin-user && npm run add-bedes-test-users)
