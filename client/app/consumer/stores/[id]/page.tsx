"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../../src/lib/api";
import { Product, Store } from "../../../../src/lib/types";
import { useCart } from "../../../../src/context/CartContext";
import { money } from "../../../../src/lib/format";

export default function StoreProductsPage() {
  const { id } = useParams<{ id: string }>();
  const { storeId, lines, setQuantity, clear } = useCart();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get(`/consumer/stores/${id}/products`)
      .then((res) => {
        setStore(res.data.store);
        setProducts(res.data.products);
        setStatus("ready");
      })
      .catch(() => setStatus("unavailable"));
  }, [id]);

  // Solo cuenta lo del carrito si es de esta tienda
  const myLines = storeId === id ? lines : [];
  const myTotal = myLines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);

  function quantityOf(productId: string) {
    return myLines.find((l) => l.product.id === productId)?.quantity ?? 0;
  }

  async function createOrder() {
    setMessage("");
    setSending(true);
    try {
      await api.post("/consumer/orders", {
        store_id: id,
        items: myLines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      });
      clear();
      setMessage("¡Orden creada! La tienda ya puede verla.");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "No se pudo crear la orden");
    } finally {
      setSending(false);
    }
  }

  if (status === "loading") return <p>Cargando...</p>;
  if (status === "unavailable" || !store) {
    return (
      <div>
        <p>Esta tienda no está disponible.</p>
        <Link href="/consumer">Volver a las tiendas</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/consumer" className="muted hover:text-white">← Tiendas</Link>
        <h1 className="mt-2">{store.name}</h1>
      </div>

      {products.length === 0 && <p className="muted">Esta tienda aún no tiene productos.</p>}
      <ul className="rows">
        {products.map((p) => {
          const q = quantityOf(p.id);
          return (
            <li key={p.id} className="row">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="muted">{money(p.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary w-9 px-0" onClick={() => setQuantity(id, p, q - 1)} disabled={q === 0}>-</button>
                <span className="w-6 text-center tabular-nums">{q}</span>
                <button className="btn-secondary w-9 px-0" onClick={() => setQuantity(id, p, q + 1)}>+</button>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="space-y-3">
        <h2>Tu orden</h2>
        {myLines.length === 0 ? (
          <p className="muted">Aún no has elegido productos.</p>
        ) : (
          <div className="card space-y-4">
            <ul className="space-y-1">
              {myLines.map((l) => (
                <li key={l.product.id} className="flex justify-between gap-4">
                  <span>{l.quantity} x {l.product.name}</span>
                  <span className="muted tabular-nums">{money(l.quantity * l.product.price)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <span className="font-semibold">Total: {money(myTotal)}</span>
              <button onClick={createOrder} disabled={sending}>Crear orden</button>
            </div>
          </div>
        )}
        {message && <p className="muted">{message}</p>}
      </section>
    </div>
  );
}