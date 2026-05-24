"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bike,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Leaf,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  Utensils
} from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { menuCategories, menuItems, type MenuItem } from "@/data/menu";

type Cart = Record<string, number>;
type FulfillmentType = "delivery" | "pickup";

type CheckoutForm = {
  customerName: string;
  phone: string;
  address: string;
  notes: string;
};

type OrderState =
  | { status: "idle" }
  | { status: "success"; orderId: string; persisted: boolean }
  | { status: "error"; message: string };

const TAX_RATE = 0.0825;
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 35;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const roundMoney = (value: number) => Math.round(value * 100) / 100;

function getOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `order-${Date.now()}`;
}

function QuantityButton({
  label,
  onClick,
  children,
  disabled
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-white text-ink hover:border-tomato hover:text-tomato disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function MenuCard({
  item,
  quantity,
  onAdd,
  onRemove
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="app-panel overflow-hidden">
      <div className="menu-image relative w-full overflow-hidden">
        <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-black">{item.name}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
          </div>
          <p className="shrink-0 text-base font-black text-tomato">{formatCurrency(item.price)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-fog px-2 py-1 text-xs font-bold text-muted">
              {tag}
            </span>
          ))}
          {item.spiceLevel ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-tomato/10 px-2 py-1 text-xs font-bold text-tomato">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              {item.spiceLevel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-md bg-basil/10 px-2 py-1 text-xs font-bold text-basil">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            {item.calories} cal
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-4">
          <div className="flex items-center gap-2">
            <QuantityButton label={`Remove ${item.name}`} onClick={onRemove} disabled={quantity === 0}>
              <Minus className="h-4 w-4" aria-hidden="true" />
            </QuantityButton>
            <span className="w-8 text-center text-sm font-black">{quantity}</span>
            <QuantityButton label={`Add ${item.name}`} onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
            </QuantityButton>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-tomato"
          >
            Add
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function OrderingApp() {
  const [activeCategory, setActiveCategory] = useState<(typeof menuCategories)[number]>("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery");
  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderState, setOrderState] = useState<OrderState>({ status: "idle" });

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const item = menuItems.find((menuItem) => menuItem.id === id);

          if (!item || quantity <= 0) {
            return null;
          }

          return {
            item,
            quantity,
            lineTotal: roundMoney(item.price * quantity)
          };
        })
        .filter((line): line is { item: MenuItem; quantity: number; lineTotal: number } => Boolean(line)),
    [cart]
  );

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = roundMoney(cartLines.reduce((sum, line) => sum + line.lineTotal, 0));
  const deliveryFee =
    fulfillmentType === "delivery" && subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const tax = roundMoney(subtotal * TAX_RATE);
  const total = roundMoney(subtotal + tax + deliveryFee);
  const supabaseReady = isSupabaseConfigured();

  function updateQuantity(id: string, nextQuantity: number) {
    setOrderState({ status: "idle" });
    setCart((currentCart) => {
      const updatedCart = { ...currentCart };

      if (nextQuantity <= 0) {
        delete updatedCart[id];
      } else {
        updatedCart[id] = nextQuantity;
      }

      return updatedCart;
    });
  }

  function incrementItem(id: string) {
    updateQuantity(id, (cart[id] ?? 0) + 1);
  }

  function decrementItem(id: string) {
    updateQuantity(id, (cart[id] ?? 0) - 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cartLines.length) {
      setOrderState({ status: "error", message: "Add at least one item before placing an order." });
      return;
    }

    if (fulfillmentType === "delivery" && !form.address.trim()) {
      setOrderState({ status: "error", message: "Add a delivery address before placing the order." });
      return;
    }

    setIsSubmitting(true);
    setOrderState({ status: "idle" });

    const orderId = getOrderId();

    try {
      if (supabaseReady) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        const { error: orderError } = await supabase.from("orders").insert({
          id: orderId,
          customer_name: form.customerName.trim(),
          phone: form.phone.trim(),
          address: fulfillmentType === "delivery" ? form.address.trim() : null,
          fulfillment_type: fulfillmentType,
          status: "received",
          subtotal,
          tax,
          delivery_fee: deliveryFee,
          total,
          notes: form.notes.trim() || null,
          user_id: user?.id ?? null
        });

        if (orderError) {
          throw orderError;
        }

        const { error: itemsError } = await supabase.from("order_items").insert(
          cartLines.map((line) => ({
            order_id: orderId,
            menu_item_id: line.item.id,
            name: line.item.name,
            quantity: line.quantity,
            unit_price: line.item.price,
            line_total: line.lineTotal
          }))
        );

        if (itemsError) {
          throw itemsError;
        }
      }

      setOrderState({ status: "success", orderId, persisted: supabaseReady });
      setCart({});
      setForm({ customerName: "", phone: "", address: "", notes: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The order could not be placed.";
      setOrderState({ status: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-ink/10 bg-white">
        <div className="section grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex flex-col justify-between gap-6 rounded-lg bg-ink p-5 text-white sm:p-6">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold">
                  <Clock className="h-4 w-4 text-saffron" aria-hidden="true" />
                  Open now - ready in 22 to 30 min
                </div>
                <div>
                  <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                    Batak food ordering, tuned for the lapo dinner rush.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                    Build an order from seasonal menu items, choose pickup or delivery, and send the checkout payload to
                    Supabase when your project keys are configured.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-black">4.8</p>
                  <p className="text-white/65">Guest rating</p>
                </div>
                <div>
                  <p className="font-black">$35</p>
                  <p className="text-white/65">Free delivery</p>
                </div>
                <div>
                  <p className="font-black">11</p>
                  <p className="text-white/65">Menu picks</p>
                </div>
              </div>
            </div>

            <div className="relative h-full min-h-64 w-full overflow-hidden rounded-lg">
              <Image
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80"
              alt="Burger and fries ready for ordering"
                fill
                priority
                sizes="(min-width: 768px) 280px, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="app-panel p-5">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <div>
                <p className="text-sm font-bold text-muted">Current order</p>
                <p className="text-2xl font-black">{formatCurrency(total)}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-tomato/10 text-tomato">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted">Items</dt>
                <dd className="font-black">{itemCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Tax</dt>
                <dd className="font-black">{formatCurrency(tax)}</dd>
              </div>
              <div>
                <dt className="text-muted">Delivery</dt>
                <dd className="font-black">{deliveryFee ? formatCurrency(deliveryFee) : "Free"}</dd>
              </div>
            </dl>
            <a
              href="#checkout"
              className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 py-3 text-sm font-black text-white hover:bg-ink"
            >
              Review checkout
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="menu" className="section grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-tomato">Menu</p>
              <h2 className="mt-2 text-3xl font-black">Order favorites</h2>
            </div>
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search menu</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bowls, salads, drinks"
                className="focus-ring h-11 w-full rounded-md border border-ink/10 bg-white pl-10 pr-3 text-sm"
              />
            </label>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {menuCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`focus-ring shrink-0 rounded-md border px-4 py-2 text-sm font-black ${
                  activeCategory === category
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white text-muted hover:text-ink"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                quantity={cart[item.id] ?? 0}
                onAdd={() => incrementItem(item.id)}
                onRemove={() => decrementItem(item.id)}
              />
            ))}
          </div>
        </div>

        <aside id="checkout" className="app-panel h-fit p-5 lg:sticky lg:top-24">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-tomato">Checkout</p>
                <h2 className="mt-1 text-2xl font-black">Your order</h2>
              </div>
              <span className="rounded-md bg-fog px-2 py-1 text-xs font-bold text-muted">
                {supabaseReady ? "Supabase ready" : "Demo mode"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`focus-ring flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-black ${
                  fulfillmentType === "delivery"
                    ? "border-tomato bg-tomato text-white"
                    : "border-ink/10 bg-white text-muted hover:text-ink"
                }`}
              >
                <Bike className="h-4 w-4" aria-hidden="true" />
                Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                className={`focus-ring flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-black ${
                  fulfillmentType === "pickup"
                    ? "border-tomato bg-tomato text-white"
                    : "border-ink/10 bg-white text-muted hover:text-ink"
                }`}
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                Pickup
              </button>
            </div>

            <div className="space-y-3 border-y border-ink/10 py-4">
              {cartLines.length ? (
                cartLines.map((line) => (
                  <div key={line.item.id} className="flex items-center gap-3">
                    <Image
                      src={line.item.image}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{line.item.name}</p>
                      <p className="text-xs text-muted">
                        {line.quantity} x {formatCurrency(line.item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="w-16 text-right text-sm font-black">{formatCurrency(line.lineTotal)}</p>
                      <button
                        type="button"
                        aria-label={`Remove ${line.item.name}`}
                        onClick={() => updateQuantity(line.item.id, 0)}
                        className="focus-ring rounded-md p-2 text-muted hover:bg-fog hover:text-tomato"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink/20 px-4 py-10 text-center">
                  <Utensils className="h-8 w-8 text-muted" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-muted">Your cart is empty.</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span className="font-bold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="font-bold">{deliveryFee ? formatCurrency(deliveryFee) : "Free"}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                <span className="font-black">Total</span>
                <span className="font-black text-tomato">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold">
                Name
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                  className="focus-ring h-11 rounded-md border border-ink/10 px-3 font-normal"
                  placeholder="Alex Morgan"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold">
                Phone
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="focus-ring h-11 rounded-md border border-ink/10 px-3 font-normal"
                  placeholder="(503) 555-0142"
                />
              </label>

              {fulfillmentType === "delivery" ? (
                <label className="grid gap-1 text-sm font-bold">
                  Delivery address
                  <input
                    required
                    value={form.address}
                    onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                    className="focus-ring h-11 rounded-md border border-ink/10 px-3 font-normal"
                    placeholder="Apartment, street, city"
                  />
                </label>
              ) : null}

              <label className="grid gap-1 text-sm font-bold">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="focus-ring min-h-20 resize-none rounded-md border border-ink/10 px-3 py-2 font-normal"
                  placeholder="Allergies, utensils, gate code"
                />
              </label>
            </div>

            {orderState.status === "error" ? (
              <p className="rounded-md border border-tomato/30 bg-tomato/10 px-3 py-2 text-sm font-bold text-tomato">
                {orderState.message}
              </p>
            ) : null}

            {orderState.status === "success" ? (
              <div className="rounded-md border border-basil/30 bg-basil/10 px-3 py-3 text-sm text-basil">
                <p className="flex items-center gap-2 font-black">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Order received
                </p>
                <p className="mt-1">
                  Confirmation {orderState.orderId.slice(0, 8)}.{" "}
                  {orderState.persisted ? "Saved in Supabase." : "Set Supabase env vars to persist orders."}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !cartLines.length}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 py-3 text-sm font-black text-white hover:bg-ink disabled:cursor-not-allowed disabled:bg-muted"
            >
              {isSubmitting ? "Placing order..." : "Place order"}
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
