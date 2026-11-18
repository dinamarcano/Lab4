"use client";
import { useEffect, useState } from "react";
import api from "../../../src/lib/api";
import { Order } from "../../../src/lib/types";
import OrderCard from "../../../src/components/OrderCard";
export default function StoreOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.get("/store/orders").then((res) => setOrders(res.data));
  }, []);

  if (!orders) return <p>Cargando...</p>;
  if (orders.length === 0) return <p>Aún no tienes órdenes.</p>;

  return (
    <div className="space-y-6">
      <h1>Órdenes</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard key={o.id} title={o.client_name} status={o.status} total={o.total} createdAt={o.created_at} items={o.items} />
        ))}
      </div>
    </div>
  );
}