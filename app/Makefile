IMAGE_NAME?=stop-motion-app:snapshot
CONTAINER_NAME?=stop-motion-app

default: build

build: Dockerfile
	docker build -f Dockerfile -t $(IMAGE_NAME) .

start: 
	docker run -d --publish 80:80 --name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
	docker stop ${CONTAINER_NAME}

clean:
	make stop
	docker rm ${CONTAINER_NAME}
	docker rmi $(IMAGE_NAME)