require('dotenv').config(); // MUST be the first line
const { Pool } = require('pg');

// Debugging: This will show if the variable is actually being loaded
if (!process.env.DB_PASSWORD) {
    console.error("❌ ERROR: DB_PASSWORD is not defined in .env file!");
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Force it to be a string
  port: process.env.DB_PORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
