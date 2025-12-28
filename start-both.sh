#!/bin/bash

# Start Laravel backend in background
# Setup Database
cd backend
if [ ! -f "database/database.sqlite" ]; then
    touch database/database.sqlite
fi
composer install --no-interaction --prefer-dist
php artisan migrate --force

# Start Laravel backend in background
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 7

# Start worker
cd ../worker
npm install
API_URL=http://localhost:8000/api node index.js &
WORKER_PID=$!

# Keep script running
wait $BACKEND_PID $WORKER_PID
