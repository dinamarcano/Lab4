require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                      
  idleTimeoutMillis: 10000,     
  connectionTimeoutMillis: 10000, 
  keepAlive: true,
});

pool.on("error", (error) => {
  console.error("Error en el pool de la base de datos:", error.message);
});

module.exports = pool;