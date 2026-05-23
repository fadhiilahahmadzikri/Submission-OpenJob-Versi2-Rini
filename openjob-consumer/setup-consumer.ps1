# Script to auto-create .env for Consumer
$examplePath = ".\.env.example"
$envPath = ".\.env"

if (!(Test-Path $examplePath)) {
    Write-Host "[!] File .env.example tidak ditemukan!" -ForegroundColor Red
    pause
    exit
}

if (!(Test-Path $envPath)) {
    Copy-Item $examplePath $envPath
    Write-Host "[+] File .env berhasil dibuat otomatis dari .env.example!" -ForegroundColor Green
} else {
    Write-Host "[!] File .env sudah ada, tidak perlu dibuat lagi." -ForegroundColor Yellow
}

Write-Host "Sedang menjalankan npm install..." -ForegroundColor Cyan
npm install

Write-Host "`nSemua siap! Sekarang Rini bisa jalankan: npm start" -ForegroundColor Green
pause
