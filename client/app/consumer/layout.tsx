"use client";
import { useRoleGuard } from "../../src/context/AuthContext";
import { CartProvider } from "../../src/context/CartContext";
import AppShell from "../../src/components/AppShell";

const LINKS = [
  { href: "/consumer", label: "Tiendas" },
  { href: "/consumer/orders", label: "Mis órdenes" },
];

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRoleGuard("consumer");
  if (!ready) return <p className="p-8 text-neutral-400">Cargando...</p>;
  return (
    <CartProvider>
      <AppShell links={LINKS}>{children}</AppShell>
    </CartProvider>
  );
}