include .env

build_frontend_build_image:
	docker build \
	--build-arg NODE_USER_ID=1000 \
	--build-arg NODE_GROUP_ID=1000 \
	-t=${FRONTEND_BUILD_IMG_NAME} \
	-f Dockerfiles/Dockerfile-angular \
	--rm=true \
	.

push_frontend_build_image_to_registry:
	docker push ${FRONTEND_BUILD_IMG_NAME}

node_modules:
	docker run -ti --rm -u node --name=${FRONTEND_BUILD_CONTAINER_NAME} \
	-e "MODE=production" \
	-v ${CURDIR}/epb/epb-frontend/:/app \
	-v ${CURDIR}/epb/epb-common/:/epb-common \
	${FRONTEND_BUILD_IMG_NAME}

ng_build:
	docker run -ti --rm -u node --name=${FRONTEND_BUILD_CONTAINER_NAME} \
	-e "MODE=production" \
	-v ${CURDIR}/epb/epb-frontend/:/app \
	-v ${CURDIR}/epb/epb-common/:/epb-common \
	${FRONTEND_BUILD_IMG_NAME} \
	ng build --prod --build-optimizer=true

# backend functions
build_backend_image:
	docker build \
	--build-arg NODE_USER_ID=1000 \
	--build-arg NODE_GROUP_ID=1000 \
	-t=${BACKEND_IMG_NAME} \
	-f Dockerfiles/Dockerfile-backend \
	--rm=true \
	.

push_backend_image_to_registry:
	docker push ${BACKEND_IMG_NAME}

# nginx image functions
build_nginx_local_image:
	docker build \
	-t=${NGINX_LOCAL_IMG_NAME} \
	-f Dockerfiles/Dockerfile-nginx-local \
	--rm=true \
	.

build_nginx_production_image:
	docker build \
	-t=${NGINX_PRODUCTION_IMG_NAME} \
	-f Dockerfiles/Dockerfile-nginx-production \
	--rm=true \
	.
