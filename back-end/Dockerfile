FROM node:20-alpine

WORKDIR /app

# On copie d'abord SEULEMENT les fichiers de dépendances.
# Tant que package.json ne change pas, Docker réutilise le cache
# et ne refait pas npm install à chaque build.
COPY package*.json ./

RUN npm install

# Le CLI Nest est utile en dev (nest g module/controller/service...)
# depuis l'intérieur du conteneur.
RUN npm i -g @nestjs/cli

# Pas de COPY . . ici : en dev, le volume monté par docker-compose
# (./back-end:/app) fournit déjà tout le code source en live.
# Un COPY . . serait immédiatement écrasé par ce volume au démarrage,
# donc inutile de l'inclure — seul package.json compte pour construire
# l'image, le reste vient du volume à l'exécution.

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
