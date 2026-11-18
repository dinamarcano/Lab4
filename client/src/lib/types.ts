export type Store = { id: string; name: string; is_open: boolean };
export type Product = { id: string; name: string; price: number; store_id: string };

export type OrderStatus = "waiting_for_deliver" | "in_progress" | "delivered";
export type OrderItem = { name: string; quantity: number; price: number };
export type Order = {
  id: string;
  status: OrderStatus;
  created_at: string;
  client_name: string;
  total: number;
  items: OrderItem[];
};
export type MyOrder = Omit<Order, "client_name"> & { store_name: string };
export type DeliveryOrder = Order & { store_name: string; delivery_id: string | null };
export const STATUS_LABELS: Record<OrderStatus, string> = {
  waiting_for_deliver: "Esperando domiciliario",
  in_progress: "En camino",
  delivered: "Entregada",
};