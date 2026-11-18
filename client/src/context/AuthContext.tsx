"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export type Role = "consumer" | "store" | "delivery";
export type User = { id: number; name: string; email: string; role: Role };

export const HOME_BY_ROLE: Record<Role, string> = {
  consumer: "/consumer",
  store: "/store",
  delivery: "/delivery",
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role, storeName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


useEffect(() => {
  const token = sessionStorage.getItem("token");

  const request = token
    ? api
        .get("/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => sessionStorage.removeItem("token"))
    : Promise.resolve();

  request.finally(() => setLoading(false));
}, []);

  function saveSession(data: { user: User; token: string }) {
    sessionStorage.setItem("token", data.token);
    setUser(data.user);
    router.push(HOME_BY_ROLE[data.user.role]);
  }

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    saveSession(res.data);
  }

  async function register(name: string, email: string, password: string, role: Role, storeName?: string) {
    const res = await api.post("/auth/register", { name, email, password, role, storeName });
    saveSession(res.data);
  }

  function logout() {
    sessionStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

// Protege una pantalla: si no hay sesión va a /login, si el rol no corresponde lo manda a su inicio
export function useRoleGuard(role: Role) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(HOME_BY_ROLE[user.role]);
  }, [user, loading, role, router]);

  return { user, ready: !loading && user?.role === role };
}