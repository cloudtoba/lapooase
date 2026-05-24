"use client";

// Orders screen: staff create a single-item Batak food order and see all locally saved tickets.
import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { OrderList } from "@/components/pos/OrderList";
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";
import type { Order } from "@/types/pos";

function nextOrderNumber(orders: Order[]) {
  const numeric = orders.map((order) => Number(order.orderNumber)).filter(Number.isFinite);
  return String((numeric.length ? Math.max(...numeric) : 1000) + 1);
}

export default function OrdersPage() {
  const { addOrder, isReady, orders } = usePOS();
  const suggestedOrderNumber = useMemo(() => nextOrderNumber(orders), [orders]);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(4.5);
  const [notes, setNotes] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = itemName.trim();
    if (!cleanName || quantity < 1 || price < 0) {
      return;
    }

    const total = Number((quantity * price).toFixed(2));
    addOrder({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      orderNumber: orderNumber.trim() || suggestedOrderNumber,
      customerName: customerName.trim() || undefined,
      items: [{ name: cleanName, qty: quantity, price }],
      notes: notes.trim() || undefined,
      status: "new",
      total
    });

    setOrderNumber("");
    setCustomerName("");
    setItemName("");
    setQuantity(1);
    setPrice(4.5);
    setNotes("");
  }

  return (
    <section className="section">
      <PageHeader
        eyebrow="Front counter"
        title="Orders"
        description="Add a Lapo Oase order, then keep the saved list visible for staff handoff."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="app-panel space-y-4 p-5">
          <div>
            <label className="text-sm font-bold" htmlFor="orderNumber">
              Order number
            </label>
            <input
              id="orderNumber"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder={suggestedOrderNumber}
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="customerName">
              Customer name
            </label>
            <input
              id="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Optional"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="itemName">
              Menu item name
            </label>
            <input
              id="itemName"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              required
              placeholder="Mie Gomak"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                min={1}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
              />
            </div>
            <div>
              <label className="text-sm font-bold" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                min={0}
                step="0.01"
                type="number"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Milk choice, allergy notes, table number"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <button
            type="submit"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add order
          </button>
        </form>

        <div>
          <h2 className="mb-3 text-xl font-black">Saved orders</h2>
          {isReady ? <OrderList orders={orders} /> : <div className="app-panel p-6 text-sm font-semibold text-muted">Loading orders...</div>}
        </div>
      </div>
    </section>
  );
}
