import Link from "next/link";
import { OrderItem, OrderStatus, STATUS_LABELS } from "../lib/types";
import { money } from "../lib/format";

type Props = {
  title: string;
  total: number;
  status?: OrderStatus;
  createdAt?: string;
  items?: OrderItem[];
  href?: string;
};

export default function OrderCard({ title, total, status, createdAt, items, href }: Props) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{title}</p>
          {createdAt && <p className="muted">{new Date(createdAt).toLocaleString("es-CO")}</p>}
        </div>
        <div className="space-y-1 text-right">
          <p className="font-medium tabular-nums">{money(total)}</p>
          {status && <span className="badge">{STATUS_LABELS[status]}</span>}
        </div>
      </div>
      {items && items.length > 0 && (
        <ul className="muted mt-3 space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>
              {item.quantity} x {item.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return href ? (
    <Link href={href} className="card block transition hover:bg-neutral-900">
      {content}
    </Link>
  ) : (
    <div className="card">{content}</div>
  );
}