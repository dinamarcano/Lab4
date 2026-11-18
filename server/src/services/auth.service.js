const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const ROLES = ["consumer", "store", "delivery"];

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function register({ name, email, password, role, storeName }) {
  if (!name || !email || !password || !ROLES.includes(role)) {
    throw { status: 400, message: "Datos incompletos o rol inválido" };
  }
  email = email.toLowerCase();

  if (role === "store" && (!storeName || !storeName.trim())) {
  throw { status: 400, message: "El nombre de la tienda es obligatorio" };
}

  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) {
    throw { status: 409, message: "Ese correo ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, passwordHash, role]
    );
    const user = result.rows[0];
    if (role === "store") {
      await client.query("INSERT INTO stores (user_owner_id, name) VALUES ($1, $2)", [
        user.id,
        storeName.trim(),
      ]);
    }
    await client.query("COMMIT");
    return { user, token: createToken(user) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  if (!email || !password) {
    throw { status: 400, message: "Correo y contraseña son obligatorios" };
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  const row = result.rows[0];
  if (!row || !(await bcrypt.compare(password, row.password))) {
    throw { status: 401, message: "Correo o contraseña incorrectos" };
  }
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  return { user, token: createToken(user) };
}

async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

module.exports = { register, login, getUserById };