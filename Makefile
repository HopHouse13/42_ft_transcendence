NAME = transcendence
COMPOSE = docker compose

all: $(NAME)
$(NAME): up

up: check_env ssl
	$(COMPOSE) up -d --build

check_env:
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file is missing. Please create it and fill values before booting."; \
		exit 1; \
	fi

ssl:
	@echo "🔐 Checking SSL certificates..."
	@bash ./proxy/generate-ssl.sh

down:
	$(COMPOSE) down

clean: down

fclean:
	$(COMPOSE) down -v
	docker system prune -af
	@echo "⚠️ Warning: all containers, images, and named database volumes have been wiped ⚠️"

re: fclean all

.PHONY: all up down clean fclean re check_env ssl