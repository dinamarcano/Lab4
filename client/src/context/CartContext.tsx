"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../../src/lib/types";

export type CartLine = { product: Product; quantity: number };

type CartContextType = {
  storeId: string | null;
  lines: CartLine[];
  setQuantity: (storeId: string, product: Product, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  function setQuantity(newStoreId: string, product: Product, quantity: number) {
    // El carrito es de una sola tienda: si cambia de tienda, se vacía
    const base = newStoreId === storeId ? lines : [];
    const exists = base.some((l) => l.product.id === product.id);

    let next: CartLine[];
    if (quantity <= 0) {
      next = base.filter((l) => l.product.id !== product.id);
    } else if (exists) {
      next = base.map((l) => (l.product.id === product.id ? { ...l, quantity } : l));
    } else {
      next = [...base, { product, quantity }];
    }
    setStoreId(newStoreId);
    setLines(next);
  }

  function clear() {
    setStoreId(null);
    setLines([]);
  }

  return (
    <CartContext.Provider value={{ storeId, lines, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}