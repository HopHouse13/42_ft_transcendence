NAME = transcendence
COMPOSE = docker compose

all: $(NAME)
$(NAME): up

up: check-env check-ssl
	$(COMPOSE) up -d --build

check-env:
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file is missing. Please create it and fill values before booting."; \
		exit 1; \
	fi
	@empty_vars=$$(grep -E '^[A-Za-z0-9_]+= *$$' .env | cut -d '=' -f 1); \
	if [ -n "$$empty_vars" ]; then \
		echo "❌ Error: The following variables in .env are empty:"; \
		echo "$$empty_vars"; \
		exit 1; \
	fi

check-ssl:
	@echo "🔐 Checking SSL certificates..."
	@chmod +x ./proxy/generate-ssl.sh
	@bash ./proxy/generate-ssl.sh

down:
	$(COMPOSE) down

clean: down

fclean:
	$(COMPOSE) down -v
	docker system prune -af
	@echo "⚠️ Warning: all containers, images, and named database volumes have been wiped ⚠️"

re: fclean all

# **************************************************************************** #
#                     EVALUATION QUALITY OF LIFE SHORTCUTS                     #
# **************************************************************************** #

logs:
	$(COMPOSE) logs -f

shell-back:
	$(COMPOSE) exec backend sh

shell-front:
	$(COMPOSE) exec frontend sh

shell-proxy:
	$(COMPOSE) exec proxy sh

shell-db:
	$(COMPOSE) exec database sh -c 'psql -U $$POSTGRES_USER -d $$POSTGRES_DB'

# ---------------------------------------------------------------------------- #


.PHONY: all up down clean fclean re check-env check-ssl logs shell-back shell-front shell-proxy shell-db
