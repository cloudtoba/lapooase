"use client";

// Browser-only persistence helpers. They keep the Lapo Oase MVP backend-free with localStorage.
import type { InventoryItem, Order } from "@/types/pos";
import { sampleInventory, sampleOrders } from "@/data/seed";

const ORDERS_KEY = "lapo-oase-orders-v2";
const INVENTORY_KEY = "lapo-oase-inventory-v3";

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

export function saveOrders(orders: Order[]) {
  writeJson(ORDERS_KEY, orders);
}

export function loadInventory() {
  return readJson<InventoryItem[]>(INVENTORY_KEY, sampleInventory);
}

export function saveInventory(items: InventoryItem[]) {
  writeJson(INVENTORY_KEY, items);
}
