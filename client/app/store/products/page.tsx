"use client";
import { useEffect, useState } from "react";
import api from "../../../src/lib/api";
import { Product } from "../../../src/lib/types";
import { money } from "../../../src/lib/format";

function ProductRow({ product, onSaved }: { product: Product; onSaved: (p: Product) => void }) {
  const [name, setName] = useState(product.name);

  async function save() {
    const res = await api.patch(`/store/products/${product.id}`, { name });
    onSaved(res.data);
  }

  return (
    <li className="row">
      <input className="flex-1" value={name} onChange={(e) => setName(e.target.value)} />
      <span className="muted w-24 text-right tabular-nums">{money(product.price)}</span>
      <button onClick={save} disabled={name === product.name}>Guardar</button>
    </li>
  );
}

export default function StoreProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/store/products").then((res) => setProducts(res.data));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/store/products", { name, price: Number(price) });
      setProducts([...products, res.data]);
      setName("");
      setPrice("");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo crear el producto");
    }
  }

  function replaceProduct(updated: Product) {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div className="space-y-6">
      <h1>Productos</h1>

      <form onSubmit={handleCreate} className="card grid gap-3 sm:grid-cols-[1fr_9rem_auto]">
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="number" min="0" placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button type="submit">Crear producto</button>
      </form>
      {error && <p className="error">{error}</p>}

      {products.length === 0 ? (
        <p className="muted">Aún no tienes productos.</p>
      ) : (
        <ul className="rows">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onSaved={replaceProduct} />
          ))}
        </ul>
      )}
    </div>
  );
}