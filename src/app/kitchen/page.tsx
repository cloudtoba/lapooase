"use client";

// Kitchen queue screen: staff update order status as tickets move through prep.
import { OrderList } from "@/components/pos/OrderList";
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";

export default function KitchenPage() {
  const { isReady, orders, updateOrderStatus } = usePOS();
  const activeOrders = orders.filter((order) => order.status !== "done");
  const doneOrders = orders.filter((order) => order.status === "done");

  return (
    <section className="section">
      <PageHeader
        eyebrow="Kitchen display"
        title="Incoming orders"
        description="Move tickets between new, preparing, and done. The same saved data powers the Orders and Reports pages."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div>
          <h2 className="mb-3 text-xl font-black">Active queue</h2>
          {isReady ? (
            <OrderList orders={activeOrders} onStatusChange={updateOrderStatus} showStatusControls />
          ) : (
            <div className="app-panel p-6 text-sm font-semibold text-muted">Loading queue...</div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-xl font-black">Done today</h2>
          {isReady ? (
            <OrderList orders={doneOrders.slice(0, 8)} onStatusChange={updateOrderStatus} showStatusControls />
          ) : (
            <div className="app-panel p-6 text-sm font-semibold text-muted">Loading completed orders...</div>
          )}
        </div>
      </div>
    </section>
  );
}
