"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../src/lib/api";
import { useAuth } from "../../../../src/context/AuthContext";
import { DeliveryOrder, STATUS_LABELS } from "../../../../src/lib/types";
import { money } from "../../../../src/lib/format";

export default function DeliveryOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/delivery/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  async function act(action: "accept" | "release" | "deliver") {
    setMessage("");
    try {
      const res = await api.post(`/delivery/orders/${id}/${action}`);
      setOrder(res.data);
    } catch (err: any) {
      const text = err.response?.data?.message;
      setMessage(typeof text === "string" ? text : "No se pudo completar la acción");
      api
        .get(`/delivery/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch(() => {});
    }
  }

  if (notFound) return <p>No se encontró la orden.</p>;
  if (!order) return <p>Cargando...</p>;

  const isMine =
    order.delivery_id !== null &&
    user?.id !== undefined &&
    String(order.delivery_id) === String(user.id);
  const takenByOther = order.delivery_id !== null && !isMine;

  return (
    <div className="space-y-6">
      <Link href="/delivery" className="muted hover:text-white">← Disponibles</Link>

      <div className="space-y-2">
        <h1>Orden de {order.store_name}</h1>
        <p className="muted">Cliente: {order.client_name}</p>
        <span className="badge">{STATUS_LABELS[order.status]}</span>
      </div>

      <ul className="rows">
        {order.items.map((item, i) => (
          <li key={i} className="row">
            <span>
              <span className="font-medium">{item.name}</span>{" "}
              <span className="muted">x {item.quantity}</span>
            </span>
            <span className="muted tabular-nums">{money(item.quantity * item.price)}</span>
          </li>
        ))}
      </ul>
      <p className="text-right text-lg font-semibold">Total: {money(order.total)}</p>

      <div className="flex flex-wrap items-center gap-3">
        {order.status === "waiting_for_deliver" && (
          <button onClick={() => act("accept")}>Aceptar orden</button>
        )}

        {takenByOther && (
          <>
            <button disabled>Aceptar orden</button>
            <p className="muted">Esta orden ya fue tomada por otro domiciliario.</p>
          </>
        )}

        {isMine && order.status === "in_progress" && (
          <>
            <button onClick={() => act("deliver")}>Marcar como entregada</button>
            <button className="btn-secondary" onClick={() => act("release")}>Soltar orden</button>
          </>
        )}

        {isMine && order.status === "delivered" && <p className="muted">Ya entregaste esta orden.</p>}
      </div>
      {message && <p className="error">{message}</p>}
    </div>
  );
}