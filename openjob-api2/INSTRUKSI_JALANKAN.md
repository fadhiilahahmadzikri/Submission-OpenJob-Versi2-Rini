# Panduan Menjalankan OpenJob API V2 - Rini

Halo Rini! Project kamu sudah diperbaiki dan semua fitur utama (termasuk Cache Redis dan Worker RabbitMQ) sudah berjalan dengan baik. Ikuti langkah-langkah di bawah ini untuk menjalankan project di laptop kamu.

## 1. Persiapan Awal (Wajib)
Pastikan kamu sudah menginstall:
*   **Node.js** (Versi 18 atau terbaru)
*   **Docker Desktop** (Sangat disarankan untuk menjalankan Database, Redis, dan RabbitMQ dengan sekali klik)

## 2. Menjalankan Layanan (Database, Redis, RabbitMQ)
Buka terminal/PowerShell di folder project, lalu jalankan perintah ini untuk menyalakan semua "mesin" yang dibutuhkan API:

```bash
docker run -d --name spectre-postgres -p 5432:5432 -e POSTGRES_PASSWORD=zikri234postgre postgres:16-alpine
docker run -d --name spectre-redis -p 6379:6379 redis:7-alpine
docker run -d --name spectre-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```

## 3. Instalasi & Setup Database
Masuk ke folder `openjob-api2` melalui terminal, lalu jalankan:

```bash
npm install
npm run setup
```
*Script ini akan otomatis membuat database `openjob` dan menjalankan migrasi tabel.*

## 4. Menjalankan Server API
Tetap di folder `openjob-api2`, jalankan:

```bash
npm run start
```
Server akan berjalan di `http://localhost:3000`. Pastikan terminal ini tetap terbuka (jangan ditutup).

## 5. Menjalankan Consumer (Worker RabbitMQ)
Buka terminal **baru**, masuk ke folder `openjob-consumer`, lalu jalankan:

```bash
npm install
npm start
```

## 6. Cara Menjalankan Test (Newman)
Jika ingin memastikan semua sudah hijau, buka terminal **baru lagi**, masuk ke folder `openjob-api2`, lalu jalankan perintah simpel ini:

```bash
npm run test:newman
```
*Script ini akan otomatis menjalankan semua tes yang ada di Postman dan menampilkan hasilnya di terminal kamu.*

---

## Catatan Penting
*   **Jika Test Ada Yang Merah:** Pastikan kamu sudah menjalankan `node patch_collection.js` di folder `punyarini` agar path file PDF sesuai dengan laptop kamu.

Semangat Rini! Project kamu sudah siap dikumpulkan.
