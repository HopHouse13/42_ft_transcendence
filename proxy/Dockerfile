FROM  nginx:1.30-alpine

# Force Nginx to drop active WebSocket connections and exit immediately on `docker compose down`
STOPSIGNAL SIGTERM

RUN   rm /etc/nginx/conf.d/default.conf

COPY  conf.d/default.conf /etc/nginx/conf.d/

EXPOSE 80 443