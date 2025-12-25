# Startup Script for Assignment 004
$php = "C:\php\php.exe"

Write-Host "🚀 Starting Assignment 004 Services..."
Write-Host "-------------------------------------"

# 1. Backend (Laravel)
if (Test-Path "backend") {
    Write-Host "Starting Backend (Laravel)..."
    # Run seed/scrape if DB is empty
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; & '$php' artisan migrate --force; & '$php' artisan scrape:initial; & '$php' artisan serve --host=127.0.0.1"
} else {
    Write-Host "❌ Backend directory not found!"
}

# 2. Frontend (React/Vite)
if (Test-Path "frontend") {
    Write-Host "Starting Frontend (React/Vite)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
} else {
    Write-Host "❌ Frontend directory not found!"
}

# 3. Worker (Node.js)
if (Test-Path "worker") {
    Write-Host "Starting Worker (Node.js)..."
    # We add a delay to let backend start and seed data
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd worker; Write-Host 'Waiting 10s for Backend...'; Start-Sleep -Seconds 10; node index.js"
} else {
    Write-Host "❌ Worker directory not found!"
}

Write-Host "-------------------------------------"
Write-Host "✅ commands sent. Check the new windows."
