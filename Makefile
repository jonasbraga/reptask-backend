USER=root
red=`tput setaf 1`
green=`tput setaf 2`
white=`tput setaf 7`
blue=`tput setaf 4`
set_prod_db=`sed -i '' 's/^DATABASE_IP.*/DATABASE_IP = postgres/' .env`
set_test_db=`sed -i '' 's/^DATABASE_IP.*/DATABASE_IP = postgres-tests/' .env`

prepare:
	cp .env.example .env
	echo "DATABASE_NAME=reptask\nDATABASE_PASS=admin\nDATABASE_PORT=5432\nDATABASE_IP=postgres-tests\nDATABASE_USER=user\nNODE_PORT=3000\nADMIN_TOKEN=5GWg^@4&d7mMJP8^8" > .env

up:
	${set_prod_db}
	docker-compose up

test:
	${set_test_db}
	docker-compose -f tests/docker-compose.yaml up -d
	docker-compose -f tests/docker-compose.yaml exec nodejs npm run test:integration && npm run test:unit
	docker-compose -f tests/docker-compose.yaml down -v

down:
	docker-compose down

start:
	docker-compose start

stop:
	docker-compose stop

sh:
	docker-compose exec --user=${USER} server sh

sh\:db:
	docker-compose exec postgres bash

help:
	@ echo "$(green) make up	  $(white) Run application containers"
	@ echo "$(green) make tests	  $(white) Run application tests inside container"
	@ echo "$(green) make down	  $(white) Stops containers and $(red)REMOVES $(white)containers and networks created by $(green)make up"
	@ echo "$(green) make start	  $(white) Starts existing containers after $(green)make stop"
	@ echo "$(green) make stop	  $(white) Stops running containers without removing them. They can be started again with $(green)make start"
	@ echo "$(green) make sh	  $(white) Connects to the server container by sh"
	@ echo "$(green) make sh:db	  $(white) Connects to the database container by sh"