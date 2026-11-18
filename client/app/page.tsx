"use client";
import Link from "next/link";
import { useAuth, useRoleGuard } from "../src/context/AuthContext";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { ready, user } = useRoleGuard("store");
  const { logout } = useAuth();

  if (!ready) return <p>Cargando...</p>;

  return (
    <div>
      <header>
        <strong>{user?.name}</strong>
        <nav>
          <Link href="/store">Mi tienda</Link>
          <Link href="/store/products">Productos</Link>
          <Link href="/store/orders">Órdenes</Link>
        </nav>
        <button onClick={logout}>Salir</button>
      </header>
      <main>{children}</main>
    </div>
  );
}