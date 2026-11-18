const pool = require("../db/pool");

async function listOpenStores() {
  const result = await pool.query(
    "SELECT id, name, is_open FROM stores WHERE is_open = TRUE ORDER BY name"
  );
  return result.rows;
}

async function getStoreWithProducts(storeId) {
  const store = await pool.query(
    "SELECT id, name, is_open FROM stores WHERE id = $1 AND is_open = TRUE",
    [storeId]
  );
  if (store.rows.length === 0) {
    throw { status: 404, message: "La tienda no existe o está cerrada" };
  }
  const products = await pool.query(
    "SELECT id, name, price, store_id FROM products WHERE store_id = $1 ORDER BY name",
    [storeId]
  );
  return { store: store.rows[0], products: products.rows };
}

async function createOrder(userId, { store_id, items }) {
  const validItems =
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((i) => i.product_id && Number.isInteger(i.quantity) && i.quantity > 0);
  if (!store_id || !validItems) {
    throw { status: 400, message: "La orden necesita una tienda y productos con cantidad" };
  }

  const client = await pool.connect();
  try {
    // La transacción asegura que se guarde la orden completa o nada
    await client.query("BEGIN");

    const store = await client.query(
      "SELECT id FROM stores WHERE id = $1 AND is_open = TRUE",
      [store_id]
    );
    if (store.rows.length === 0) {
      throw { status: 409, message: "La tienda está cerrada o no existe" };
    }

    // Todos los productos deben ser de esa tienda
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const products = await client.query(
      "SELECT id FROM products WHERE store_id = $1 AND id = ANY($2::uuid[])",
      [store_id, productIds]
    );
    if (products.rows.length !== productIds.length) {
      throw { status: 400, message: "Algún producto no pertenece a esta tienda" };
    }

    const order = await client.query(
      `INSERT INTO orders (client_id, store_id) VALUES ($1, $2)
       RETURNING id, status, created_at`,
      [userId, store_id]
    );
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
        [order.rows[0].id, item.product_id, item.quantity]
      );
    }

    await client.query("COMMIT");
    return order.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listMyOrders(userId) {
  const result = await pool.query(
    `SELECT o.id, o.status, o.created_at, s.name AS store_name,
            COALESCE(SUM(oi.quantity * p.price), 0)::int AS total,
            COALESCE(
              json_agg(json_build_object(
                'name', p.name, 'quantity', oi.quantity, 'price', p.price
              )) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.client_id = $1
     GROUP BY o.id, s.name
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { listOpenStores, getStoreWithProducts, createOrder, listMyOrders };
