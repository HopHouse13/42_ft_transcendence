#!/bin/sh
set -e # arrete le script immédiatement si une commande échoue (une bonne pratique)

echo "Deploy database..."

npx prisma migrate deploy  || { echo "Migration failed!" >&2; exit 1; } # ">&2" redérige vers la sorrtie d'erreur (FD2)

echo "Deploy finished!"

exec "$@" # Remplace le processus shell par la commande passée en argument. Ici c'est "npm" "run" "start:dev"