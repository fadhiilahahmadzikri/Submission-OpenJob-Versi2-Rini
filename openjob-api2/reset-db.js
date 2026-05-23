require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

async function reset() {
  try {
    console.log('Clearing database tables...');
    await pool.query('TRUNCATE users, authentications, companies, categories, jobs, applications, bookmarks, documents RESTART IDENTITY CASCADE');
    console.log('✅ Database cleared');
  } catch (err) {
    console.error('❌ Error resetting database:', err.message);
  } finally {
    await pool.end();
  }
}

reset();