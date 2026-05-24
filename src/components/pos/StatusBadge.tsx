// Small visual label for kitchen order state.
import type { OrderStatus } from "@/types/pos";

const styles: Record<OrderStatus, string> = {
  new: "bg-saffron/20 text-ink ring-saffron/40",
  preparing: "bg-ocean/10 text-ocean ring-ocean/20",
  done: "bg-basil/10 text-basil ring-basil/20"
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold capitalize ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
