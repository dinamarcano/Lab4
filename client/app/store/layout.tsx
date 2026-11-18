"use client";
import { useRoleGuard } from "../../src/context/AuthContext";
import AppShell from "../../src/components/AppShell";

const LINKS = [
  { href: "/store", label: "Mi tienda" },
  { href: "/store/products", label: "Productos" },
  { href: "/store/orders", label: "Órdenes" },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRoleGuard("store");
  if (!ready) return <p className="p-8 text-neutral-400">Cargando...</p>;
  return <AppShell links={LINKS}>{children}</AppShell>;
}