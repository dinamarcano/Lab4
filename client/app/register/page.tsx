"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth, Role } from "../../src/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("consumer");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password, role, storeName);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "No se pudo crear la cuenta",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1>Crear cuenta</h1>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="consumer">Consumidor</option>
          <option value="store">Tienda</option>
          <option value="delivery">Domiciliario</option>
        </select>
        {role === "store" && (
          <input
            placeholder="Nombre de la tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="w-full">
          Registrarme
        </button>
        <p className="muted text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-white underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
