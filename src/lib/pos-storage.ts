"use client";

// Browser persistence helpers. Supabase is the primary store when configured; localStorage remains the dev fallback.
import type { Expense, InventoryItem, Order } from "@/types/pos";
import { sampleExpenses, sampleInventory, sampleOrders } from "@/data/seed";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const ORDERS_KEY = "lapo-oase-orders-v2";
const INVENTORY_KEY = "lapo-oase-inventory-v3";
const EXPENSES_KEY = "lapo-oase-expenses-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function loadOrders() {
  return readJson<Order[]>(ORDERS_KEY, sampleOrders);
}

export function saveOrdersLocal(orders: Order[]) {
  writeJson(ORDERS_KEY, orders);
}

export function loadInventory() {
  return readJson<InventoryItem[]>(INVENTORY_KEY, sampleInventory);
}

export function saveInventoryLocal(items: InventoryItem[]) {
  writeJson(INVENTORY_KEY, items);
}

export function loadExpenses() {
  return readJson<Expense[]>(EXPENSES_KEY, sampleExpenses);
}

export function saveExpensesLocal(expenses: Expense[]) {
  writeJson(EXPENSES_KEY, expenses);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint, record.code].filter(Boolean);

    if (parts.length) {
      return parts.join(" ");
    }

    try {
      return JSON.stringify(record);
    } catch {
      return "Unknown object error";
    }
  }

  return String(error);
}

function isMissingSupabaseRelation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as Record<string, unknown>;
  return record.code === "PGRST205" || String(record.message ?? "").includes("Could not find the table");
}

function toOrder(row: {
  id: string;
  created_at: string;
  order_number: string;
  customer_name: string | null;
  notes: string | null;
  status: Order["status"];
  subtotal: number | null;
  discount_type: Order["discountType"] | null;
  discount_label: string | null;
  discount_rate: number | null;
  discount_amount: number | null;
  total: number;
  pos_order_items?: {
    name: string;
    quantity: number;
    unit_price: number;
    category: string | null;
    notes: string | null;
    gross_line_total: number | null;
    discount_amount: number | null;
    net_line_total: number | null;
  }[];
}): Order {
  const total = Number(row.total);
  const discountAmount = Number(row.discount_amount ?? 0);

  return {
    id: row.id,
    createdAt: row.created_at,
    orderNumber: row.order_number,
    customerName: row.customer_name ?? undefined,
    items:
      row.pos_order_items?.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: Number(item.unit_price),
        category: item.category ?? undefined,
        notes: item.notes ?? undefined,
        grossLineTotal: item.gross_line_total === null ? undefined : Number(item.gross_line_total),
        discountAmount: item.discount_amount === null ? undefined : Number(item.discount_amount),
        netLineTotal: item.net_line_total === null ? undefined : Number(item.net_line_total)
      })) ?? [],
    notes: row.notes ?? undefined,
    status: row.status,
    subtotal: row.subtotal === null ? total + discountAmount : Number(row.subtotal),
    discountType: row.discount_type ?? "none",
    discountLabel: row.discount_label ?? undefined,
    discountRate: row.discount_rate === null ? 0 : Number(row.discount_rate),
    discountAmount,
    total
  };
}

export async function loadOrdersRemote() {
  if (!isSupabaseConfigured()) {
    return loadOrders();
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("pos_orders")
    .select(
      "id, created_at, order_number, customer_name, notes, status, subtotal, discount_type, discount_label, discount_rate, discount_amount, total, pos_order_items(name, quantity, unit_price, category, notes, gross_line_total, discount_amount, net_line_total, sort_order)"
    )
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "pos_order_items", ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toOrder);
}

export async function addOrderRemote(order: Order) {
  if (!isSupabaseConfigured()) {
    const nextOrders = [order, ...loadOrders()];
    saveOrdersLocal(nextOrders);
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.rpc("create_pos_order", {
    order_payload: {
      id: order.id,
      created_at: order.createdAt,
      order_number: order.orderNumber,
      customer_name: order.customerName ?? null,
      notes: order.notes ?? null,
      status: order.status,
      subtotal: order.subtotal ?? order.total,
      discount_type: order.discountType ?? "none",
      discount_label: order.discountLabel ?? null,
      discount_rate: order.discountRate ?? 0,
      discount_amount: order.discountAmount ?? 0,
      total: order.total,
      items: order.items.map((item, index) => ({
        name: item.name,
        quantity: item.qty,
        unit_price: item.price,
        category: item.category ?? null,
        notes: item.notes ?? null,
        gross_line_total: item.grossLineTotal ?? item.qty * item.price,
        discount_amount: item.discountAmount ?? 0,
        net_line_total: item.netLineTotal ?? item.qty * item.price,
        sort_order: index
      }))
    }
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateOrderStatusRemote(id: string, status: Order["status"], fallbackOrders: Order[]) {
  if (!isSupabaseConfigured()) {
    saveOrdersLocal(fallbackOrders);
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("pos_orders").update({ status }).eq("id", id);

  if (error && isMissingSupabaseRelation(error)) {
    saveOrdersLocal(fallbackOrders);
    return;
  }

  if (error) {
    throw error;
  }
}

export async function loadInventoryRemote() {
  if (!isSupabaseConfigured()) {
    return loadInventory();
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("inventory_items").select("id, name, stock, unit").order("name");

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return sampleInventory;
  }

  return data.map((item) => ({ ...item, stock: Number(item.stock) }));
}

export async function updateStockRemote(id: string, stock: number, fallbackInventory: InventoryItem[]) {
  if (!isSupabaseConfigured()) {
    saveInventoryLocal(fallbackInventory);
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("inventory_items").update({ stock }).eq("id", id);

  if (error) {
    throw error;
  }
}

function toExpense(row: {
  id: string;
  created_at: string;
  expense_date: string;
  description: string;
  category: Expense["category"];
  amount: number;
  payment_method: Expense["paymentMethod"];
  vendor: string | null;
  notes: string | null;
}): Expense {
  return {
    id: row.id,
    createdAt: row.created_at,
    expenseDate: row.expense_date,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    vendor: row.vendor ?? undefined,
    notes: row.notes ?? undefined
  };
}

export async function loadExpensesRemote() {
  if (!isSupabaseConfigured()) {
    return loadExpenses();
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("pos_expenses")
    .select("id, created_at, expense_date, description, category, amount, payment_method, vendor, notes")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error && isMissingSupabaseRelation(error)) {
    return loadExpenses();
  }

  if (error) {
    throw error;
  }

  return (data ?? []).map(toExpense);
}

export async function addExpenseRemote(expense: Expense) {
  if (!isSupabaseConfigured()) {
    const nextExpenses = [expense, ...loadExpenses()];
    saveExpensesLocal(nextExpenses);
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("pos_expenses").insert({
    id: expense.id,
    created_at: expense.createdAt,
    expense_date: expense.expenseDate,
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    payment_method: expense.paymentMethod,
    vendor: expense.vendor ?? null,
    notes: expense.notes ?? null
  });

  if (error && isMissingSupabaseRelation(error)) {
    const nextExpenses = [expense, ...loadExpenses()];
    saveExpensesLocal(nextExpenses);
    return;
  }

  if (error) {
    throw error;
  }
}
