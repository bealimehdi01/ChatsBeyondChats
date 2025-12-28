# Startup Script for Assignment 004 (Local Windows)
# Usage: Right-click > Run with PowerShell

Write-Host "🚀 Starting Local Environment..." -ForegroundColor Green
Write-Host "-------------------------------------"

# Helper to check command
function Test-Command ($command) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

# Check PHP
if (-not (Test-Command "php")) {
    Write-Host "❌ PHP not found in PATH! Please install PHP or add it to PATH." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check Node
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js not found in PATH!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# 1. Backend (Laravel)
if (Test-Path "backend") {
    Write-Host "Starting Backend..." -ForegroundColor Cyan
    # Start Backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Clearing Cache...'; php artisan optimize:clear; Write-Host 'Checking Database...'; php artisan migrate --force; Write-Host 'Backend Running on port 8000...'; php artisan serve"
} else {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
}

# 2. Worker (Node.js)
if (Test-Path "worker") {
    Write-Host "Starting Worker..." -ForegroundColor Cyan
    # Start Worker in new window with delay
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd worker; Write-Host 'Waiting for Backend...'; Start-Sleep -Seconds 5; node index.js"
} else {
    Write-Host "❌ Worker directory not found!" -ForegroundColor Red
}

# 3. Frontend (React)
if (Test-Path "frontend") {
    Write-Host "Starting Frontend..." -ForegroundColor Cyan
    # Start Frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
}

Write-Host "-------------------------------------"
Write-Host "✅ All services launched!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
Read-Host "Press Enter to close this launcher..."
