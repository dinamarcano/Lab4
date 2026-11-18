require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                       // pocas conexiones abiertas a la vez
  idleTimeoutMillis: 10000,     // cierra las inactivas antes de que Supabase las mate
  connectionTimeoutMillis: 10000, // si no logra conectar, falla en 10 s y no se queda colgado
  keepAlive: true,
});

pool.on("error", (error) => {
  console.error("Error en el pool de la base de datos:", error.message);
});

module.exports = pool;