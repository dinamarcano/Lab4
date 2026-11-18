"use client";
import { useEffect, useState } from "react";
import api from "../../../src/lib/api";
import { DeliveryOrder } from "../../../src/lib/types";
import OrderCard from "@/src/components/OrderCard";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState<DeliveryOrder[] | null>(null);

  useEffect(() => {
    api.get("/delivery/history").then((res) => setOrders(res.data));
  }, []);

  if (!orders) return <p>Cargando...</p>;
  if (orders.length === 0) return <p>Aún no has aceptado órdenes.</p>;

  return (
    <div className="space-y-6">
      <h1>Historial</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            title={`${o.store_name} → ${o.client_name}`}
            status={o.status}
            total={o.total}
            createdAt={o.created_at}
            href={`/delivery/orders/${o.id}`}
          />
        ))}
      </div>
    </div>
  );
}