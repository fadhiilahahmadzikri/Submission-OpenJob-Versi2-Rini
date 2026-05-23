const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, 'Postman_Collection.json');
const absolutePdfPath = 'D:\\\\dicoding-codingcamp\\\\Submission-11\\\\punyarini\\\\Submission-OpenJob-Versi2\\\\openjob-api2\\\\uploads\\\\sample-resume.pdf';

let content = fs.readFileSync(collectionPath, 'utf8');

// Replace the Linux path with our local Windows path
// Note: Use 4 backslashes for JSON escaping of a Windows path
content = content.replace(/\/home\/aras\/javascript-projects\/271-openjob\/sample-resume\.pdf/g, absolutePdfPath);

fs.writeFileSync(collectionPath, content);
console.log('✅ Postman collection patched with local PDF path');