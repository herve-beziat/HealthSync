.PHONY: env perms init build launch remove logs ps start stop rebuild help

init: env perms
	@echo "Initialisation terminée."

env: # Crée le fichier .env à partir de l'exemple s'il n'existe pas déjà
	@if [ ! -f "./docker/.env" ]; then \
			cp ./docker/.env.example ./docker/.env; \
			echo "Created .env from example"; \
	else \
			echo ".env already exists"; \
	fi
perms:
	@chmod +x ./docker/docker.sh

# --- Docker ---
build:
	./docker/docker.sh build

launch:
	./docker/docker.sh up -d --build

remove:
	./docker/docker.sh down -v

logs-all:
	./docker/docker.sh logs -f

logs:
	./docker/docker.sh logs -f $(s)

ps:
	./docker/docker.sh ps

start:
	./docker/docker.sh start

stop:
	./docker/docker.sh stop

rebuild: # Reconstruire un service ex:make rebuild s=api
	./docker/docker.sh stop $(s) || true
	./docker/docker.sh rm -f $(s) || true
	./docker/docker.sh up -d --build $(s)

prisma-generate:
	@cd api && npm run prisma:generate

test-all:
	@cd api && npm run test

test:
	@cd api && npm run test $(s)

# --- Help ---
help: # Affiche les commandes disponibles
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done
