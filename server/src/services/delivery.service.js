const pool = require("../db/pool");

// Misma consulta para lista, detalle e historial: solo cambia el WHERE
function ordersQuery(where, direction = "DESC") {
  return `
    SELECT o.id, o.status, o.created_at, o.delivery_id,
           s.name AS store_name, u.name AS client_name,
           COALESCE(SUM(oi.quantity * p.price), 0)::int AS total,
           COALESCE(
             json_agg(json_build_object(
               'name', p.name, 'quantity', oi.quantity, 'price', p.price
             )) FILTER (WHERE oi.id IS NOT NULL),
             '[]'
           ) AS items
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    JOIN users u ON u.id = o.client_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    ${where}
    GROUP BY o.id, s.name, u.name
    ORDER BY o.created_at ${direction}`;
}

async function listAvailable() {
  const result = await pool.query(
    ordersQuery("WHERE o.status = 'waiting_for_deliver'", "ASC")
  );
  return result.rows;
}

async function getOrder(orderId) {
  const result = await pool.query(ordersQuery("WHERE o.id = $1"), [orderId]);
  if (result.rows.length === 0) {
    throw { status: 404, message: "Orden no encontrada" };
  }
  return result.rows[0];
}

async function listHistory(userId) {
  const result = await pool.query(ordersQuery("WHERE o.delivery_id = $1"), [userId]);
  return result.rows;
}

// Cada acción es un solo UPDATE con condiciones en el WHERE.
// Si dos domiciliarios aceptan a la vez, Postgres atiende uno primero
// y para el segundo la condición ya no se cumple (0 filas actualizadas).
async function accept(userId, orderId) {
  const result = await pool.query(
    `UPDATE orders SET status = 'in_progress', delivery_id = $1
     WHERE id = $2 AND status = 'waiting_for_deliver' AND delivery_id IS NULL`,
    [userId, orderId]
  );
  if (result.rowCount === 0) {
    throw { status: 409, message: "Esta orden ya no está disponible: otro domiciliario la tomó" };
  }
  return getOrder(orderId);
}

async function release(userId, orderId) {
  const result = await pool.query(
    `UPDATE orders SET status = 'waiting_for_deliver', delivery_id = NULL
     WHERE id = $2 AND delivery_id = $1 AND status = 'in_progress'`,
    [userId, orderId]
  );
  if (result.rowCount === 0) {
    throw { status: 409, message: "No puedes soltar esta orden" };
  }
  return getOrder(orderId);
}

async function deliver(userId, orderId) {
  const result = await pool.query(
    `UPDATE orders SET status = 'delivered'
     WHERE id = $2 AND delivery_id = $1 AND status = 'in_progress'`,
    [userId, orderId]
  );
  if (result.rowCount === 0) {
    throw { status: 409, message: "No puedes marcar esta orden como entregada" };
  }
  return getOrder(orderId);
}

module.exports = { listAvailable, getOrder, listHistory, accept, release, deliver };