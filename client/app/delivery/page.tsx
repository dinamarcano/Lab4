"use client";
import { useEffect, useState } from "react";
import api from "../../src/lib/api";
import { DeliveryOrder } from "../../src/lib/types";
import OrderCard from "../../src/components/OrderCard";

export default function DeliveryHome() {
  const [orders, setOrders] = useState<DeliveryOrder[] | null>(null);

  useEffect(() => {
    api.get("/delivery/orders/available").then((res) => setOrders(res.data));
  }, []);

  async function refresh() {
    const res = await api.get("/delivery/orders/available");
    setOrders(res.data);
  }

  if (!orders) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Órdenes disponibles</h1>
        <button className="btn-secondary" onClick={refresh}>Actualizar</button>
      </div>
      {orders.length === 0 && <p className="muted">No hay órdenes para entregar por ahora.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            title={`${o.store_name} → ${o.client_name}`}
            total={o.total}
            createdAt={o.created_at}
            href={`/delivery/orders/${o.id}`}
          />
        ))}
      </div>
    </div>
  );
}