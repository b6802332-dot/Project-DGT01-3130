const { Pool } = require('pg');
module.exports = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'sisdb',
  user: process.env.DB_USER || 'sis',
  password: process.env.DB_PASSWORD,
  max: 10,
});
