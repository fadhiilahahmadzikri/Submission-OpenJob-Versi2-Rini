require('dotenv').config({ override: true });

const pool = require('./services/database');

const testConnection = async () => {
  console.log('DB Config:', {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  });
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected');
  } catch (error) {
    console.log(error);
  }
};

testConnection();