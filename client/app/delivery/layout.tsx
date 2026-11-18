"use client";
import { useRoleGuard } from "../../src/context/AuthContext";
import AppShell from "../../src/components/AppShell";

const LINKS = [
  { href: "/delivery", label: "Disponibles" },
  { href: "/delivery/history", label: "Historial" },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRoleGuard("delivery");
  if (!ready) return <p className="p-8 text-neutral-400">Cargando...</p>;
  return <AppShell links={LINKS}>{children}</AppShell>;
}