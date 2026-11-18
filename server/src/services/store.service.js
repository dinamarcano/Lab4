const pool = require("../db/pool");

const STORE_OF_USER = "(SELECT id FROM stores WHERE user_owner_id = $1)";

async function getMyStore(userId) {
  const result = await pool.query(
    "SELECT id, name, is_open FROM stores WHERE user_owner_id = $1",
    [userId]
  );
  return result.rows[0];
}

async function toggleOpen(userId) {
  const result = await pool.query(
    `UPDATE stores SET is_open = NOT is_open
     WHERE user_owner_id = $1 RETURNING id, name, is_open`,
    [userId]
  );
  return result.rows[0];
}

async function listProducts(userId) {
  const result = await pool.query(
    `SELECT id, name, price, store_id FROM products
     WHERE store_id = ${STORE_OF_USER} ORDER BY name`,
    [userId]
  );
  return result.rows;
}

async function createProduct(userId, { name, price }) {
  if (!name || !name.trim() || !Number.isInteger(price) || price < 0) {
    throw { status: 400, message: "Nombre y precio válidos son obligatorios" };
  }
  const result = await pool.query(
    `INSERT INTO products (name, price, store_id)
     VALUES ($2, $3, ${STORE_OF_USER})
     RETURNING id, name, price, store_id`,
    [userId, name.trim(), price]
  );
  return result.rows[0];
}

async function updateProductName(userId, productId, { name }) {
  if (!name || !name.trim()) {
    throw { status: 400, message: "El nombre es obligatorio" };
  }
  // El AND store_id evita que una tienda edite productos de otra
  const result = await pool.query(
    `UPDATE products SET name = $3
     WHERE id = $2 AND store_id = ${STORE_OF_USER}
     RETURNING id, name, price, store_id`,
    [userId, productId, name.trim()]
  );
  if (result.rows.length === 0) {
    throw { status: 404, message: "Producto no encontrado" };
  }
  return result.rows[0];
}

async function listOrders(userId) {
  const result = await pool.query(
    `SELECT o.id, o.status, o.created_at, u.name AS client_name,
            COALESCE(SUM(oi.quantity * p.price), 0)::int AS total,
            COALESCE(
              json_agg(json_build_object(
                'name', p.name, 'quantity', oi.quantity, 'price', p.price
              )) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     JOIN users u ON u.id = o.client_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.store_id = ${STORE_OF_USER}
     GROUP BY o.id, u.name
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { getMyStore, toggleOpen, listProducts, createProduct, updateProductName, listOrders };