const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, 'Postman_Collection.json');
// Sekarang menggunakan path.join agar otomatis mendeteksi folder dimana script ini dijalankan
const absolutePdfPath = path.join(__dirname, 'uploads', 'sample-resume.pdf').replace(/\\/g, '\\\\');

if (!fs.existsSync(collectionPath)) {
    console.error('❌ File Postman_Collection.json tidak ditemukan!');
    process.exit(1);
}

let content = fs.readFileSync(collectionPath, 'utf8');

// Mencari pattern path lama (apapun isinya) dan menggantinya dengan path laptop Rini saat ini
// Kita cari pattern yang mirip dengan path sample-resume.pdf di dalam JSON
const pathRegex = /"value":\s*".*?sample-resume\.pdf"/g;
const newPathValue = `"value": "${absolutePdfPath}"`;

content = content.replace(pathRegex, newPathValue);

fs.writeFileSync(collectionPath, content);
console.log('✅ Postman collection berhasil di-patch!');
console.log('📍 Path baru:', absolutePdfPath);