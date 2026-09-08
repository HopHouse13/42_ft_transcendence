# ---------- Étape 1 : build de l'application React ----------
FROM node:20-alpine AS build

WORKDIR /app

# On copie d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json* ./
RUN npm ci

# Puis le reste du code source
COPY . .

# Build de production (Vite -> dossier /app/dist)
RUN npm run build

# ---------- Étape 2 : image finale, on ne garde que le build statique ----------
FROM nginx:1.27-alpine AS production

# Config nginx dédiée au SPA (routes React Router -> index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On copie uniquement le résultat du build, pas node_modules ni le code source
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
