#!/bin/bash

# Start Laravel backend in background
cd backend
php artisan serve --host=0.0.0.0 --port=8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start worker
cd ../worker
API_URL=http://localhost:8000/api node index.js &
WORKER_PID=$!

# Keep script running
wait $BACKEND_PID $WORKER_PID
