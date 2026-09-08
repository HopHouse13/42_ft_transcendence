FROM  nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost"

# Suprime la config par defaut
RUN   rm /etc/nginx/conf.d/default.conf

# Copie te config personnalisee
COPY  conf.d/default.conf /etc/nginx/conf.d/
# COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

# (Optionnel) Si tu veux servir des fichiers statiques plus tard
# COPY ../frontend/dist /usr/share/nginx/html
