# OpenJob API V2 Quick Start Script for Rini

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   OpenJob API V2 Quick Start Tool" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running/responsive
Write-Host "Sedang mengecek koneksi Docker..." -ForegroundColor Gray
& docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Docker belum siap atau belum jalan. Tolong pastikan Docker Desktop sudah terbuka dan Engine-nya 'Running' ya Rini!" -ForegroundColor Red
    pause
    exit
}

# 1. PostgreSQL
Write-Host "[1/3] Menyiapkan PostgreSQL..." -ForegroundColor Yellow
docker run -d --name spectre-postgres -p 5432:5432 -e POSTGRES_PASSWORD=zikri234postgre postgres:16-alpine 2>$null
docker start spectre-postgres 2>$null

# 2. Redis
Write-Host "[2/3] Menyiapkan Redis..." -ForegroundColor Yellow
docker run -d --name spectre-redis -p 6379:6379 redis:7-alpine 2>$null
docker start spectre-redis 2>$null

# 3. RabbitMQ
Write-Host "[3/3] Menyiapkan RabbitMQ..." -ForegroundColor Yellow
docker run -d --name spectre-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine 2>$null
docker start spectre-rabbitmq 2>$null

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   Semua layanan (DB, Redis, MQ) READY!" -ForegroundColor Green
Write-Host "   Rini sekarang bisa lanjut ke npm run setup." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
pause
