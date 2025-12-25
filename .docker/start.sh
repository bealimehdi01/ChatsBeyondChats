#!/bin/bash
set -e

echo "🚀 EXISTING ENV CHECK:"
ls -la /app/backend

echo "🔍 CHECKING ROLE: ${CONTAINER_ROLE:-backend}"

if [ "$CONTAINER_ROLE" = "worker" ]; then
    echo "👷 STARTING WORKER MODE..."
    cd /app/worker
    exec node index.js
else
    echo "🖥️ STARTING BACKEND MODE..."
    
    echo "🔧 Fixing Permissions..."
    touch /app/backend/database/database.sqlite
    chmod 777 /app/backend/database/database.sqlite
    chown -R www-data:www-data /app/backend/storage /app/backend/database

    echo "🏃 Running Migrations..."
    cd /app/backend
    php artisan migrate --force || echo "⚠️ Migration Failed (Continuing...)"
    php artisan scrape:initial || echo "⚠️ Seeding Failed (Continuing...)"

    echo "🔥 Starting Nginx + PHP..."
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
fi
