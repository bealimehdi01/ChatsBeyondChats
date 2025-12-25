#!/bin/bash

echo "🚀 Starting BeyondChats Backend..."

# 1. Ensure DB Exists
touch /app/backend/database/database.sqlite
chmod 777 /app/backend/database/database.sqlite
chmod -R 777 /app/backend/storage

# 2. Initialize Laravel
cd /app/backend
echo "💥 Running Migrations..."
php artisan migrate --force

echo "🌱 Seeding Initial Data..."
php artisan scrape:initial

# 3. Start Supervisor (The Boss)
echo "🔥 Starting Services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
