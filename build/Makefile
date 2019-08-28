include .env

# build the angular builder
build_ng_image:
	cd .. && docker build \
		-t ${ANGULAR_BUILD_IMAGE} \
		-f ./build/Dockerfiles/Dockerfile-angular \
		--rm=true \
		.

# build the script runner image
build_scripts_image:
	cd .. && docker build \
		-t ${SCRIPT_IMAGE} \
		-f ./build/Dockerfiles/Dockerfile-scripts \
		--rm=true \
		.

# run all initialization scripts
run_scripts-init:
	make run_scripts-load-data
	make run_scripts-add-bedes-admin-user
	make run_scripts-add-bedes-test-users

# load an initial set of bedes-terms
run_scripts-load-data:
	docker run \
		--network=${DOCKER_NET_NAME} \
		--env-file=.env \
		--rm \
		--name=${SCRIPT_CONTAINER} \
		${SCRIPT_IMAGE} \
		load-all-compose

# create the bedes-admin account
run_scripts-add-bedes-admin-user:
	docker run \
		--network=${DOCKER_NET_NAME} \
		--env-file=.env \
		--rm \
		--name=${SCRIPT_CONTAINER} \
		${SCRIPT_IMAGE} \
		add-bedes-admin-user

# create the bedes test-user accounts
run_scripts-add-bedes-test-users:
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
