"use client";
import { useEffect, useState } from "react";
import api from "../../src/lib/api";
import { Store } from "../../src/lib/types";

export default function StoreHome() {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    api.get("/store/me").then((res) => setStore(res.data));
  }, []);

  async function toggle() {
    const res = await api.patch("/store/me/toggle");
    setStore(res.data);
  }

  if (!store) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1>{store.name}</h1>
        <p className="muted mt-1">
          Estado:{" "}
          <span className={store.is_open ? "text-green-400" : "text-red-400"}>
            {store.is_open ? "Abierta" : "Cerrada"}
          </span>
        </p>
      </div>
      <button onClick={toggle}>{store.is_open ? "Cerrar tienda" : "Abrir tienda"}</button>
    </div>
  );
}