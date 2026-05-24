// Shared order list for Orders and Kitchen pages.
import type { Order, OrderStatus } from "@/types/pos";
import { StatusBadge } from "@/components/pos/StatusBadge";
import { formatIDR } from "@/lib/currency";

const statuses: OrderStatus[] = ["new", "preparing", "done"];

export function OrderList({
  orders,
  onStatusChange,
  showStatusControls = false
}: {
  orders: Order[];
  onStatusChange?: (id: string, status: OrderStatus) => void;
  showStatusControls?: boolean;
}) {
  if (orders.length === 0) {
    return <div className="app-panel p-6 text-sm font-semibold text-muted">No orders saved yet.</div>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="app-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black">Order #{order.orderNumber}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {order.customerName ? `${order.customerName} · ` : ""}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="text-xl font-black">{formatIDR(order.total)}</p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              {order.items.map((item) => (
                <p key={`${order.id}-${item.name}`} className="text-sm font-semibold">
                  {item.qty} x {item.name} <span className="text-muted">@ {formatIDR(item.price)}</span>
                </p>
              ))}
              {order.notes ? <p className="mt-2 text-sm text-muted">Notes: {order.notes}</p> : null}
            </div>

            {showStatusControls && onStatusChange ? (
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(order.id, status)}
                    className="focus-ring rounded-md border border-ink/10 bg-white px-3 py-2 text-sm font-bold capitalize hover:border-ocean hover:text-ocean disabled:bg-fog disabled:text-muted"
                    disabled={order.status === status}
                  >
                    {status}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
