#!/bin/bash

# Navigate to backend directory
cd backend

# Generate key if not set (prevents 500 Server Error)
php artisan key:generate --force

# Start the server in the background
php artisan serve --host=0.0.0.0 --port=8000 &

# Wait a bit for the server to start
sleep 5

# Run migrations (this won't block the server since it's already running in bg)
php artisan migrate --force

# Keep the script running so the container doesn't exit
wait
