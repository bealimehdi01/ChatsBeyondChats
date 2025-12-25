#!/bin/bash
set -e

echo "🚀 EXISTING ENV CHECK:"
ls -la /app/backend

echo "🔧 Fixing Permissions..."
touch /app/backend/database/database.sqlite
chmod 777 /app/backend/database/database.sqlite
chown -R www-data:www-data /app/backend/storage /app/backend/database

echo "🏃 Running Migrations..."
cd /app/backend
# Capture output to see why it fails
php artisan migrate --force || echo "⚠️ Migration Failed (But continuing...)"
php artisan scrape:initial || echo "⚠️ Seeding Failed (But continuing...)"

echo "🔥 Starting Supervisor..."
# Use exec to ensuring PID 1
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
