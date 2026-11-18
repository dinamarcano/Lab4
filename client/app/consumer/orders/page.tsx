"use client";
import { useEffect, useState } from "react";
import api from "../../../src/lib/api";
import { MyOrder } from "../../../src/lib/types";
import OrderCard from "../../../src/components/OrderCard";

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);

  useEffect(() => {
    api.get("/consumer/orders").then((res) => setOrders(res.data));
  }, []);

  async function refresh() {
    const res = await api.get("/consumer/orders");
    setOrders(res.data);
  }

  if (!orders) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Mis órdenes</h1>
        <button className="btn-secondary" onClick={refresh}>Actualizar estado</button>
      </div>
      {orders.length === 0 && <p className="muted">Aún no has hecho órdenes.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard key={o.id} title={o.store_name} status={o.status} total={o.total} createdAt={o.created_at} items={o.items} />
        ))}
      </div>
    </div>
  );
}