FRONTEND_BUILD_IMG=bedes_ng_build_img
FRONTEND_BUILD_CONTAINER=bedes_ng_build_container
SCRIPT_IMG=bedes_script_img
SCRIPT_CONTAINER=bedes_script_container

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

build_mappings_image:
	docker build -t=${SCRIPT_IMG} -f ./build/Dockerfiles/Dockerfile-mappings --rm=true .

load_all_mappings:
	docker run -ti --rm -u node --name=${SCRIPT_CONTAINER} \
	${SCRIPT_IMG} 

load_all_mappings_bash:
	docker run -ti --rm -u node --name=${SCRIPT_CONTAINER} \
	${SCRIPT_IMG} \
	/bin/bash

build_ng_image:
	docker build -t=${FRONTEND_BUILD_IMG} -f ./build/Dockerfiles/Dockerfile-angular --rm=true .

ng_build:
	docker run -ti --rm -u node --name=${FRONTEND_BUILD_CONTAINER} \
	-e "MODE=production" \
	-v ${CURDIR}/bedes-frontend/:/app \
	-v ${CURDIR}/bedes-common/:/bedes-common \
	${FRONTEND_BUILD_IMG} 


ng_bash:
	docker run -ti --rm -u node --name=${FRONTEND_BUILD_CONTAINER} \
	-e "MODE=production" \
	-v ${CURDIR}/bedes-frontend/:/app \
	-v ${CURDIR}/bedes-common/:/bedes-common \
	${FRONTEND_BUILD_IMG} \
	/bin/bash


