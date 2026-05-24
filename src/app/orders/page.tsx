"use client";

// Orders screen: staff pick from structured Lapo Oase menus and see locally saved tickets.
import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { OrderList } from "@/components/pos/OrderList";
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";
import { menuCategories, menuItems, type MenuCategory, type MenuItemDefinition } from "@/data/pos-menu";
import { formatIDR } from "@/lib/currency";
import type { OrderItem } from "@/types/pos";
import type { Order } from "@/types/pos";

function nextOrderNumber(orders: Order[]) {
  const numeric = orders.map((order) => Number(order.orderNumber)).filter(Number.isFinite);
  return String((numeric.length ? Math.max(...numeric) : 1000) + 1);
}

function getDefaultChoices(item: MenuItemDefinition) {
  if (item.choiceMode === "none") {
    return [];
  }
  return item.choices?.[0] ? [item.choices[0].name] : [];
}

function getDefaultTemperature(item: MenuItemDefinition) {
  return item.temperatureOptions?.[0]?.name ?? "";
}

function buildOrderItems(item: MenuItemDefinition, choices: string[], temperature: string, quantity: number): OrderItem[] {
  const temperatureChoice = item.temperatureOptions?.find((option) => option.name === temperature);
  const temperaturePrice = temperatureChoice?.priceDelta ?? 0;

  if (item.choiceMode === "none") {
    return [{ name: item.name, qty: quantity, price: item.basePrice + temperaturePrice }];
  }

  return choices.map((choiceName) => {
    const choice = item.choices?.find((option) => option.name === choiceName);
    const price = item.basePrice + (choice?.priceDelta ?? 0) + temperaturePrice;
    const parts = [item.name, choiceName, temperature].filter(Boolean);
    return { name: parts.join(" - "), qty: quantity, price };
  });
}

export default function OrdersPage() {
  const { addOrder, isReady, orders } = usePOS();
  const suggestedOrderNumber = useMemo(() => nextOrderNumber(orders), [orders]);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [category, setCategory] = useState<MenuCategory>("Food");
  const filteredItems = useMemo(() => menuItems.filter((item) => item.category === category), [category]);
  const [menuItemId, setMenuItemId] = useState(filteredItems[0]?.id ?? menuItems[0].id);
  const selectedMenuItem = menuItems.find((item) => item.id === menuItemId) ?? menuItems[0];
  const [selectedChoices, setSelectedChoices] = useState<string[]>(getDefaultChoices(selectedMenuItem));
  const [temperature, setTemperature] = useState(getDefaultTemperature(selectedMenuItem));
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const previewItems = buildOrderItems(selectedMenuItem, selectedChoices, temperature, quantity);
  const orderTotal = previewItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  function selectCategory(nextCategory: MenuCategory) {
    const nextItem = menuItems.find((item) => item.category === nextCategory) ?? menuItems[0];
    setCategory(nextCategory);
    setMenuItemId(nextItem.id);
    setSelectedChoices(getDefaultChoices(nextItem));
    setTemperature(getDefaultTemperature(nextItem));
  }

  function selectMenuItem(nextId: string) {
    const nextItem = menuItems.find((item) => item.id === nextId) ?? menuItems[0];
    setMenuItemId(nextItem.id);
    setSelectedChoices(getDefaultChoices(nextItem));
    setTemperature(getDefaultTemperature(nextItem));
  }

  function toggleChoice(choiceName: string) {
    if (selectedMenuItem.choiceMode === "single") {
      setSelectedChoices([choiceName]);
      return;
    }

    setSelectedChoices((current) =>
      current.includes(choiceName) ? current.filter((choice) => choice !== choiceName) : [...current, choiceName]
    );
  }

  function applyAllChoices() {
    setSelectedChoices(selectedMenuItem.choices?.map((choice) => choice.name) ?? []);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (previewItems.length === 0 || quantity < 1) {
      return;
    }

    addOrder({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      orderNumber: orderNumber.trim() || suggestedOrderNumber,
      customerName: customerName.trim() || undefined,
      items: previewItems,
      notes: notes.trim() || undefined,
      status: "new",
      total: orderTotal
    });

    setOrderNumber("");
    setCustomerName("");
    setCategory("Food");
    selectMenuItem(menuItems[0].id);
    setQuantity(1);
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
            <label className="text-sm font-bold" htmlFor="category">
              Menu section
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => selectCategory(event.target.value as MenuCategory)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            >
              {menuCategories.map((menuCategory) => (
                <option key={menuCategory} value={menuCategory}>
                  {menuCategory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="menuItem">
              Menu
            </label>
            <select
              id="menuItem"
              value={menuItemId}
              onChange={(event) => selectMenuItem(event.target.value)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            >
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {selectedMenuItem.temperatureOptions ? (
            <div>
              <p className="text-sm font-bold">Temperature</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {selectedMenuItem.temperatureOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setTemperature(option.name)}
                    className={`focus-ring rounded-md border px-3 py-3 text-sm font-bold ${
                      temperature === option.name ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                    }`}
                  >
                    {option.name}
                    {option.priceDelta ? ` +${formatIDR(option.priceDelta)}` : ""}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selectedMenuItem.choices?.length ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">{selectedMenuItem.choiceMode === "multi" ? "Choices" : "Choice"}</p>
                {selectedMenuItem.choiceMode === "multi" ? (
                  <button type="button" onClick={applyAllChoices} className="focus-ring rounded-md px-2 py-1 text-xs font-black text-ocean">
                    Apply all
                  </button>
                ) : null}
              </div>
              {selectedMenuItem.helper ? <p className="mt-1 text-xs font-semibold text-muted">{selectedMenuItem.helper}</p> : null}
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {selectedMenuItem.choices.map((choice) => {
                  const isSelected = selectedChoices.includes(choice.name);
                  return (
                    <button
                      key={choice.name}
                      type="button"
                      onClick={() => toggleChoice(choice.name)}
                      className={`focus-ring min-h-12 rounded-md border px-3 py-2 text-left text-sm font-bold ${
                        isSelected ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                      }`}
                    >
                      {choice.name}
                      {choice.priceDelta ? <span className="block text-xs opacity-80">+{formatIDR(choice.priceDelta)}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

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

          <div className="rounded-md bg-fog p-3">
            <p className="text-xs font-black uppercase text-muted">Order preview</p>
            <div className="mt-2 space-y-1">
              {previewItems.length ? (
                previewItems.map((item) => (
                  <p key={item.name} className="text-sm font-bold">
                    {item.qty} x {item.name} <span className="text-muted">@ {formatIDR(item.price)}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm font-semibold text-muted">Pick at least one choice.</p>
              )}
            </div>
            <p className="mt-3 text-xl font-black">{formatIDR(orderTotal)}</p>
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
              placeholder="Spice level, allergy notes, table number"
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
