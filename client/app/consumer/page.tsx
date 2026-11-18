"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../../src/lib/api";
import { Store } from "../../src/lib/types";

export default function ConsumerHome() {
  const [stores, setStores] = useState<Store[] | null>(null);

  useEffect(() => {
    api.get("/consumer/stores").then((res) => setStores(res.data));
  }, []);

  if (!stores) return <p>Cargando...</p>;
  if (stores.length === 0) return <p>No hay tiendas abiertas en este momento.</p>;

  return (
    <div className="space-y-6">
      <h1>Tiendas abiertas</h1>
      <ul className="rows">
        {stores.map((s) => (
          <li key={s.id}>
            <Link href={`/consumer/stores/${s.id}`} className="row transition hover:bg-neutral-900">
              <span className="font-medium">{s.name}</span>
              <span className="muted">Ver productos →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}