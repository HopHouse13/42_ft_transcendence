#!/bin/sh
set -e

echo "Deploy database..."

npx prisma migrate deploy

echo "Deploy finished!"

exec "$@"