#!/bin/bash

echo "🚀 Container Starting..."
echo "🔍 ROLE: ${CONTAINER_ROLE:-backend}"

if [ "$CONTAINER_ROLE" = "worker" ]; then
    echo "👷 WORKER MODE"
    cd /app/worker
    exec node index.js
else
    echo "🖥️ BACKEND MODE"
    
    # Ensure directories exist
    mkdir -p /app/backend/database
    mkdir -p /app/backend/storage/logs
    mkdir -p /app/backend/storage/framework/{sessions,views,cache}
    
    # Create and fix permissions
    touch /app/backend/database/database.sqlite
    chmod -R 777 /app/backend/storage
    chmod -R 777 /app/backend/database
    
    cd /app/backend
    
    # Run migrations (allow failure)
    php artisan migrate --force 2>&1 || echo "⚠️ Migration skipped"
    php artisan scrape:initial 2>&1 || echo "⚠️ Seeding skipped"
    
    # Start services
    echo "🔥 Starting Supervisor (Nginx + PHP-FPM)"
    exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
fi

