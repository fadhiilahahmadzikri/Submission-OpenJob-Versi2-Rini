require('dotenv').config();
const { Client } = require('pg');

async function setup() {
  // Connect to default 'postgres' database to create the target database
  const client = new Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = process.env.PGDATABASE;

    // Check if database exists
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );

    if (!res.rows.length) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Run migrations
  const { execSync } = require('child_process');
  console.log('⏳ Running migrations...');
  execSync('npx node-pg-migrate up', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Migrations complete');
  console.log('\n🚀 Ready! Run: npm run start:dev');
}

setup();
