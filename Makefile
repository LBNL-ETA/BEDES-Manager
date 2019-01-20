include environment/docker.env

install-db:
	echo "build the database"
	(cd bedes-db && make install_and_run) && \
		sleep 8 && \
		cd scripts/db && make db_build_all

install-backend:
	echo "backend: npm install"
	cd bedes-backend && npm install -y

install-common:
	echo "common: npm install"
	cd bedes-common && npm install -y

install-scripts:
	echo "scripts: npm install"
	cd scripts/ts && npm install -y

install:
	make install-db && \
	make install-backend && \
	make install-common && \
	make install-scripts && \
	echo "done"

build_ng_image:
	docker build -t=${ANGULAR_BUILD_IMAGE} -f ./build/Dockerfiles/Dockerfile-angular --rm=true .

build_ng_image_no_cache:
	docker build -t=${ANGULAR_BUILD_IMAGE} --no-cache -f ./build/Dockerfiles/Dockerfile-angular --rm=true .

ng_build:
	docker run -ti --rm \
	--name=${ANGULAR_BUILD_CONTAINER} \
	-e "MODE=production" \
	-v ${CURDIR}/bedes-frontend/:/app \
	-v ${CURDIR}/bedes-common/:/bedes-common \
	${ANGULAR_BUILD_IMAGE}
