"use client";

// Orders screen: staff build one customer ticket from multiple menu items, then save it to the POS store.
import { FormEvent, useMemo, useState } from "react";
import { Coffee, Cookie, Plus, Save, Soup, Trash2, X } from "lucide-react";
import { OrderList } from "@/components/pos/OrderList";
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";
import { menuCategories, menuItems, type MenuCategory, type MenuItemDefinition } from "@/data/pos-menu";
import { formatIDR } from "@/lib/currency";
import { isPOSDemoMode } from "@/lib/supabase/client";
import type { DiscountType, OrderItem } from "@/types/pos";
import type { Order } from "@/types/pos";

type TicketItem = OrderItem & {
  lineId: string;
};

function toOrderItem(item: TicketItem): OrderItem {
  return {
    name: item.name,
    qty: item.qty,
    price: item.price,
    category: item.category,
    notes: item.notes,
    grossLineTotal: item.grossLineTotal,
    discountAmount: item.discountAmount,
    netLineTotal: item.netLineTotal
  };
}

function nextOrderNumber(orders: Order[]) {
  return String(orders.length + 1);
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

function getDefaultOptionGroups(item: MenuItemDefinition) {
  return Object.fromEntries(item.optionGroups?.map((group) => [group.id, group.options[0]?.name ? [group.options[0].name] : []]) ?? []);
}

function parsePositivePrice(price: string) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null;
}

function buildOptionGroupItem(item: MenuItemDefinition, optionGroups: Record<string, string[]>, temperature: string, quantity: number): OrderItem {
  const selectedOptions =
    item.optionGroups
      ?.flatMap((group) => {
        const selectedNames = optionGroups[group.id] ?? [];
        return selectedNames.map((name) => group.options.find((option) => option.name === name)).filter(Boolean);
      })
      .filter(Boolean) ?? [];
  const temperatureChoice = item.temperatureOptions?.find((option) => option.name === temperature);
  const price =
    selectedOptions.reduce((sum, option) => sum + (option?.priceDelta ?? 0), item.basePrice) +
    (temperatureChoice?.priceDelta ?? 0);
  const displayOptions = selectedOptions.map((option) => option?.name).filter((name) => name && name !== "Polos");
  const [primaryOption, ...extraOptions] = displayOptions;
  const optionText = primaryOption ? `${primaryOption}${extraOptions.length ? ` + ${extraOptions.join(" + ")}` : ""}` : "";
  const parts = [`${item.name}${optionText ? ` ${optionText}` : ""}`, temperature].filter(Boolean);

  return { name: parts.join(" - "), qty: quantity, price, category: item.category };
}

function buildOrderItems(
  item: MenuItemDefinition,
  choices: string[],
  optionGroups: Record<string, string[]>,
  manualChoicePrice: string,
  temperature: string,
  quantity: number
): OrderItem[] {
  const temperatureChoice = item.temperatureOptions?.find((option) => option.name === temperature);
  const temperaturePrice = temperatureChoice?.priceDelta ?? 0;

  if (item.optionGroups?.length) {
    return [buildOptionGroupItem(item, optionGroups, temperature, quantity)];
  }

  if (item.choiceMode === "none") {
    return [{ name: item.name, qty: quantity, price: item.basePrice + temperaturePrice, category: item.category }];
  }

  const orderItems: OrderItem[] = [];

  choices.forEach((choiceName) => {
    const choice = item.choices?.find((option) => option.name === choiceName);
    const manualPrice = choice?.manualPrice ? parsePositivePrice(manualChoicePrice) : null;

    if (choice?.manualPrice && !manualPrice) {
      return;
    }

    const price = manualPrice ?? choice?.price ?? item.basePrice + (choice?.priceDelta ?? 0) + temperaturePrice;
    const parts = [item.name, choiceName, temperature].filter(Boolean);
    orderItems.push({ name: parts.join(" - "), qty: quantity, price, category: item.category });
  });

  return orderItems;
}

function buildCustomOrderItems(description: string, price: string, quantity: number): OrderItem[] {
  const normalizedDescription = description.trim();
  const numericPrice = Number(price);

  if (!normalizedDescription || !Number.isFinite(numericPrice) || numericPrice <= 0 || quantity < 1) {
    return [];
  }

  return [{ name: `Custom - ${normalizedDescription}`, qty: quantity, price: numericPrice, category: "Custom" }];
}

function getDiscountConfig(type: DiscountType, customRate: string) {
  if (type === "opening_10") {
    return { label: "Opening promo 10%", rate: 0.1 };
  }

  if (type === "google_review_20") {
    return { label: "Google review 20%", rate: 0.2 };
  }

  if (type === "custom") {
    const rate = Number(customRate);
    return Number.isFinite(rate) && rate > 0 ? { label: `Custom ${rate}%`, rate: Math.min(rate, 100) / 100 } : { label: "Custom discount", rate: 0 };
  }

  return { label: "No discount", rate: 0 };
}

function getMenuIcon(category: MenuCategory) {
  if (category === "Minuman") {
    return Coffee;
  }

  if (category === "Snacks") {
    return Cookie;
  }

  return Soup;
}

const tableNumbers = Array.from({ length: 16 }, (_, index) => String(index + 1));
const orderSlots = ["A", "B", "C", "D", "E", "F", "G", "H"];

function applyDiscount(items: TicketItem[], discountRate: number): TicketItem[] {
  return items.map((item) => {
    const grossLineTotal = item.qty * item.price;
    const discountAmount = Math.round(grossLineTotal * discountRate);
    const netLineTotal = grossLineTotal - discountAmount;

    return {
      ...item,
      grossLineTotal,
      discountAmount,
      netLineTotal
    };
  });
}

export default function OrdersPage() {
  const { addOrder, isReady, orders } = usePOS();
  const isDemoMode = isPOSDemoMode();
  const suggestedOrderNumber = useMemo(() => nextOrderNumber(orders), [orders]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedOrderSlot, setSelectedOrderSlot] = useState("");
  const orderNumber = selectedTable && selectedOrderSlot ? `M${selectedTable}-${selectedOrderSlot}` : "";
  const [category, setCategory] = useState<MenuCategory>("Makanan");
  const filteredItems = useMemo(() => menuItems.filter((item) => item.category === category), [category]);
  const [menuItemId, setMenuItemId] = useState("");
  const selectedMenuItem = menuItems.find((item) => item.id === menuItemId);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [selectedOptionGroups, setSelectedOptionGroups] = useState<Record<string, string[]>>({});
  const [temperature, setTemperature] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customDescription, setCustomDescription] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [manualChoicePrice, setManualChoicePrice] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const isCustomCategory = category === "Custom";
  const selectedManualChoice = selectedMenuItem?.choices?.find((choice) => selectedChoices.includes(choice.name) && choice.manualPrice);
  const previewItems = isCustomCategory
    ? buildCustomOrderItems(customDescription, customPrice, Math.max(quantity, 1))
    : selectedMenuItem
      ? buildOrderItems(selectedMenuItem, selectedChoices, selectedOptionGroups, manualChoicePrice, temperature, Math.max(quantity, 1))
      : [];
  const previewTotal = previewItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discountConfig = getDiscountConfig("none", "");
  const ticketSubtotal = ticketItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discountedTicketItems = applyDiscount(ticketItems, discountConfig.rate);
  const ticketDiscountAmount = discountedTicketItems.reduce((sum, item) => sum + (item.discountAmount ?? 0), 0);
  const ticketTotal = discountedTicketItems.reduce((sum, item) => sum + (item.netLineTotal ?? item.qty * item.price), 0);

  function selectCategory(nextCategory: MenuCategory) {
    setCategory(nextCategory);
    setCustomDescription("");
    setCustomPrice("");
    setManualChoicePrice("");
    setMenuItemId("");
    setSelectedChoices([]);
    setSelectedOptionGroups({});
    setTemperature("");
    setItemNotes("");
    setQuantity(1);
  }

  function selectMenuItem(nextId: string) {
    const nextItem = menuItems.find((item) => item.id === nextId) ?? menuItems[0];
    setMenuItemId(nextItem.id);
    setSelectedChoices(getDefaultChoices(nextItem));
    setSelectedOptionGroups(getDefaultOptionGroups(nextItem));
    setTemperature(getDefaultTemperature(nextItem));
    setManualChoicePrice("");
  }

  function selectOptionGroup(groupId: string, optionName: string) {
    const group = selectedMenuItem?.optionGroups?.find((optionGroup) => optionGroup.id === groupId);

    setSelectedOptionGroups((current) => {
      if (group?.mode !== "multi") {
        return { ...current, [groupId]: [optionName] };
      }

      const currentGroup = current[groupId] ?? [];

      if (optionName === "Polos") {
        return { ...current, [groupId]: ["Polos"] };
      }

      const withoutPolos = currentGroup.filter((name) => name !== "Polos");
      const nextGroup = withoutPolos.includes(optionName)
        ? withoutPolos.filter((name) => name !== optionName)
        : [...withoutPolos, optionName];

      return { ...current, [groupId]: nextGroup.length ? nextGroup : ["Polos"] };
    });
  }

  function toggleChoice(choiceName: string) {
    if (selectedMenuItem?.choiceMode === "single") {
      setSelectedChoices([choiceName]);
      setManualChoicePrice("");
      return;
    }

    setSelectedChoices((current) =>
      current.includes(choiceName) ? current.filter((choice) => choice !== choiceName) : [...current, choiceName]
    );
  }

  function applyAllChoices() {
    setSelectedChoices(selectedMenuItem?.choices?.map((choice) => choice.name) ?? []);
  }

  function addItemsToTicket() {
    if (previewItems.length === 0 || quantity < 1) {
      return;
    }

    const notesValue = itemNotes.trim() || undefined;

    setTicketItems((current) => {
      const next = [...current];

      previewItems.forEach((item) => {
        const existingIndex = next.findIndex((ticketItem) => ticketItem.name === item.name && ticketItem.price === item.price && ticketItem.notes === notesValue);

        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            qty: next[existingIndex].qty + item.qty
          };
          return;
        }

        next.push({
          ...item,
          notes: notesValue,
          lineId: crypto.randomUUID()
        });
      });

      return next;
    });

    setQuantity(1);
    setItemNotes("");
    setCustomDescription("");
    setCustomPrice("");
    setManualChoicePrice("");
    setMenuItemId("");
    setSelectedChoices([]);
    setSelectedOptionGroups({});
    setTemperature("");
  }

  function removeTicketItem(lineId: string) {
    setTicketItems((current) => current.filter((item) => item.lineId !== lineId));
  }

  function updateTicketItemQty(lineId: string, nextQty: number) {
    if (nextQty < 1) {
      removeTicketItem(lineId);
      return;
    }

    setTicketItems((current) => current.map((item) => (item.lineId === lineId ? { ...item, qty: nextQty } : item)));
  }

  function clearTicket() {
    setTicketItems([]);
    setNotes("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (ticketItems.length === 0) {
      return;
    }

    addOrder({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      orderNumber: orderNumber || suggestedOrderNumber,
      customerName: undefined,
      items: discountedTicketItems.map(toOrderItem),
      notes: notes.trim() || undefined,
      status: "new",
      subtotal: ticketSubtotal,
      discountType: "none",
      discountLabel: discountConfig.label,
      discountRate: discountConfig.rate,
      discountAmount: ticketDiscountAmount,
      total: ticketTotal
    });

    setSelectedOrderSlot("");
    setCategory("Makanan");
    setMenuItemId("");
    setSelectedChoices([]);
    setSelectedOptionGroups({});
    setTemperature("");
    setQuantity(1);
    setCustomDescription("");
    setCustomPrice("");
    setManualChoicePrice("");
    setItemNotes("");
    setNotes("");
    setTicketItems([]);
  }

  function renderQuickAddControls(className = "") {
    if (!isCustomCategory && !selectedMenuItem) {
      return null;
    }

    return (
      <div className={`rounded-md border border-ink/10 bg-fog p-3 ${className}`}>
        {!isCustomCategory && selectedMenuItem?.temperatureOptions ? (
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

        {!isCustomCategory
          ? selectedMenuItem?.optionGroups?.map((group) => (
              <div key={group.id} className="mt-3 first:mt-0">
                <p className="text-sm font-bold">{group.label}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {group.options.map((option) => {
                    const isSelected = selectedOptionGroups[group.id]?.includes(option.name) ?? false;

                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => selectOptionGroup(group.id, option.name)}
                        className={`focus-ring min-h-12 rounded-md border px-3 py-2 text-left text-sm font-bold ${
                          isSelected ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                        }`}
                      >
                        {option.name}
                        {option.price ? <span className="block text-xs opacity-80">{formatIDR(option.price)}</span> : null}
                        {option.priceDelta ? <span className="block text-xs opacity-80">+{formatIDR(option.priceDelta)}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          : null}

        {!isCustomCategory && selectedMenuItem?.choices?.length ? (
          <div className="mt-3 first:mt-0">
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
                    {choice.price ? <span className="block text-xs opacity-80">{formatIDR(choice.price)}</span> : null}
                    {!choice.price && choice.priceDelta ? <span className="block text-xs opacity-80">+{formatIDR(choice.priceDelta)}</span> : null}
                    {choice.priceHint ? <span className="block text-xs opacity-80">{choice.priceHint}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isCustomCategory && selectedManualChoice ? (
          <div className="mt-3">
            <label className="text-sm font-bold" htmlFor="manualChoicePrice">
              {selectedManualChoice.name} price
            </label>
            <input
              id="manualChoicePrice"
              min={1}
              inputMode="numeric"
              type="number"
              value={manualChoicePrice}
              onChange={(event) => setManualChoicePrice(event.target.value)}
              placeholder="25000 - 30000"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
            {selectedManualChoice.priceHint ? <p className="mt-1 text-xs font-semibold text-muted">{selectedManualChoice.priceHint}</p> : null}
          </div>
        ) : null}

        <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
          <div>
            <p className="text-sm font-bold">Quantity</p>
            <div className="mt-2 inline-flex h-12 items-center overflow-hidden rounded-md border border-ink/10 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="focus-ring h-12 w-12 text-lg font-black hover:bg-fog"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-14 text-center text-lg font-black">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="focus-ring h-12 w-12 text-lg font-black hover:bg-fog"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="itemNotes">
              Notes
            </label>
            <input
              id="itemNotes"
              value={itemNotes}
              onChange={(event) => setItemNotes(event.target.value)}
              placeholder="Tanpa es, pedas, kuah sedikit"
              className="focus-ring mt-2 h-12 w-full rounded-md border border-ink/10 bg-white px-3"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addItemsToTicket}
          disabled={previewItems.length === 0 || quantity < 1}
          className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ocean px-4 py-3 text-sm font-black text-white hover:bg-ink disabled:cursor-not-allowed disabled:bg-muted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item {previewItems.length ? `- ${formatIDR(previewTotal)}` : ""}
        </button>
      </div>
    );
  }

  return (
    <section className="section">
      <PageHeader
        eyebrow="Front counter"
        title="Orders"
        description="Add a Lapo Oase order, then keep the saved list visible for staff handoff."
      />

      {isDemoMode ? (
        <div className="mb-4 rounded-md border border-ocean/20 bg-ocean/10 px-4 py-3 text-sm font-bold text-ocean">
          Demo mode aktif. Order hanya tersimpan di perangkat ini dan tidak masuk Supabase/Grafana.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="app-panel relative space-y-4 p-5">
          <div className="border-b border-ink/10 pb-4">
            <h2 className="text-xl font-black">Customer ticket</h2>
            <p className="mt-1 text-sm font-semibold text-muted">Pilih nomor meja, lalu klik menu yang dipesan.</p>
          </div>

          <div>
            <p className="text-sm font-bold" id="table-number-label">
              Meja
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5" role="group" aria-labelledby="table-number-label">
              {tableNumbers.map((tableNumber) => (
                <button
                  key={tableNumber}
                  type="button"
                  onClick={() => setSelectedTable(tableNumber)}
                  className={`focus-ring h-9 rounded-md border text-sm font-black ${
                    selectedTable === tableNumber ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                  }`}
                >
                  {tableNumber}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold" id="order-slot-label">
              Order
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5" role="group" aria-labelledby="order-slot-label">
              {orderSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedOrderSlot(slot)}
                  className={`focus-ring h-9 rounded-md border text-sm font-black ${
                    selectedOrderSlot === slot ? "border-ocean bg-ocean text-white" : "border-ink/10 bg-white hover:border-ocean"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-muted">Ticket: {orderNumber || "pilih meja + order"}</p>
          </div>

          <div className="border-t border-ink/10 pt-4">
            <h3 className="text-base font-black">Add item</h3>
          </div>

          <div>
            <p className="text-sm font-bold" id="category-label">
              Menu section
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby="category-label">
              {menuCategories.map((menuCategory) => (
                <button
                  key={menuCategory}
                  type="button"
                  onClick={() => selectCategory(menuCategory)}
                  className={`focus-ring min-h-12 rounded-md border px-3 py-2 text-sm font-black ${
                    category === menuCategory ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                  }`}
                >
                  {menuCategory}
                </button>
              ))}
            </div>
          </div>

          {isCustomCategory ? (
            <>
              <div>
                <label className="text-sm font-bold" htmlFor="customDescription">
                  Custom order
                </label>
                <textarea
                  id="customDescription"
                  value={customDescription}
                  onChange={(event) => setCustomDescription(event.target.value)}
                  rows={3}
                  placeholder="Example: telor setengah matang"
                  className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-bold" htmlFor="customPrice">
                  Custom price
                </label>
                <input
                  id="customPrice"
                  min={1}
                  inputMode="numeric"
                  type="number"
                  value={customPrice}
                  onChange={(event) => setCustomPrice(event.target.value)}
                  placeholder="Example: 10000"
                  className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-bold" id="menu-item-label">
                  Menu
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-labelledby="menu-item-label">
                  {filteredItems.map((item) => {
                    const isSelected = menuItemId === item.id;
                    const MenuIcon = getMenuIcon(item.category);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectMenuItem(item.id)}
                        className={`focus-ring flex aspect-square min-h-24 flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-center text-sm font-black leading-tight ${
                          isSelected ? "border-tomato bg-tomato text-white" : "border-ink/10 bg-white hover:border-tomato"
                        }`}
                      >
                        <MenuIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {isCustomCategory ? renderQuickAddControls() : null}
          {!isCustomCategory && selectedMenuItem ? (
            <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-lg bg-paper/95 p-2 shadow-2xl ring-1 ring-ink/10 backdrop-blur md:absolute md:inset-x-5 md:bottom-5">
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Selected</p>
                  <p className="text-base font-black">{selectedMenuItem.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuItemId("")}
                  className="focus-ring rounded-md p-2 text-muted hover:bg-fog hover:text-tomato"
                  aria-label="Close quick add"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {renderQuickAddControls()}
            </div>
          ) : null}
        </div>

        <aside className="app-panel flex flex-col p-5">
          <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ocean">Current order</p>
              <h2 className="mt-1 text-2xl font-black">Ticket #{orderNumber || suggestedOrderNumber}</h2>
            </div>
            {ticketItems.length ? (
              <button type="button" onClick={clearTicket} className="focus-ring rounded-md p-2 text-muted hover:bg-fog hover:text-tomato" aria-label="Clear ticket">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="min-h-56 flex-1 divide-y divide-ink/10">
            {ticketItems.length ? (
              ticketItems.map((item) => (
                <div key={item.lineId} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="mt-1 text-sm font-semibold text-muted">@ {formatIDR(item.price)}</p>
                      {item.notes ? <p className="mt-1 text-xs font-bold text-ocean">Notes: {item.notes}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTicketItem(item.lineId)}
                      className="focus-ring rounded-md p-2 text-muted hover:bg-fog hover:text-tomato"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-ink/10 bg-white">
                      <button
                        type="button"
                        onClick={() => updateTicketItemQty(item.lineId, item.qty - 1)}
                        className="focus-ring h-10 w-10 text-lg font-black hover:bg-fog"
                        aria-label={`Decrease ${item.name}`}
                      >
                        -
                      </button>
                      <input
                        value={item.qty}
                        min={1}
                        type="number"
                        onChange={(event) => updateTicketItemQty(item.lineId, Number(event.target.value))}
                        className="h-10 w-14 border-x border-ink/10 text-center text-sm font-black"
                        aria-label={`${item.name} quantity`}
                      />
                      <button
                        type="button"
                        onClick={() => updateTicketItemQty(item.lineId, item.qty + 1)}
                        className="focus-ring h-10 w-10 text-lg font-black hover:bg-fog"
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-black">{formatIDR(item.qty * item.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-56 items-center justify-center py-8 text-center text-sm font-semibold text-muted">
                Belum ada item. Pilih makanan, minuman, snacks, atau custom sebelum simpan.
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="notes">
              Order notes
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

          <div className="mt-4 border-t border-ink/10 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm font-bold text-muted">
                <span>Subtotal</span>
                <span>{formatIDR(ticketSubtotal)}</span>
              </div>
              {ticketDiscountAmount > 0 ? (
                <div className="flex items-center justify-between gap-4 text-sm font-bold text-muted">
                  <span>{discountConfig.label}</span>
                  <span>-{formatIDR(ticketDiscountAmount)}</span>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink/10 pt-3">
              <span className="text-sm font-black uppercase tracking-[0.14em] text-muted">Total</span>
              <span className="text-2xl font-black">{formatIDR(ticketTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={ticketItems.length === 0}
            className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato disabled:cursor-not-allowed disabled:bg-muted"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save order
          </button>
        </aside>
      </form>

      <div className="mt-6">
        <h2 className="mb-3 text-xl font-black">Saved orders</h2>
        {isReady ? <OrderList orders={orders} /> : <div className="app-panel p-6 text-sm font-semibold text-muted">Loading orders...</div>}
      </div>
    </section>
  );
}
