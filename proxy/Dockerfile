FROM  nginx:alpine

# Suprime la config par defaut
RUN   rm /etc/nginx/conf.d/default.conf

# Copie te config personnalisee
COPY  conf.d/default.conf /etc/nginx/conf.d/
COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

# (Optionnel) Si tu veux servir des fichiers statiques plus tard
# COPY ../frontend/dist /usr/share/nginx/html
