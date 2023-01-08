### docker build
IMAGE_NAME?=stop-motion-api:snapshot
CONTAINER_NAME?=stop-motion-api

default: build

check-install:
	which docker
	which docker-compose

check-repositories:
	echo "check folder for stop-motion-api project"
	test -d ../stop-motion-api/.git
	echo "check folder for stop-motion-app project"
	test -d ../stop-motion-app/.git

build: docker/Dockerfile
	docker build -f docker/Dockerfile -t $(IMAGE_NAME) .

start: 
	docker run -d --publish 9000:9000 --name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
	docker stop ${CONTAINER_NAME}

clean:
	make stop
	docker rm ${CONTAINER_NAME}
	docker rmi $(IMAGE_NAME)

update-deployment: check-install check-repositories
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml up -d

stop-deployment:
	docker-compose -f docker-compose.yml down

show-logs:
	docker-compose logs -f

clean-deployment:
	sudo rm -rf $(DATA_DIR)
	docker rm -f $(shell docker ps -qa)
	docker rmi $(shell docker images -q)