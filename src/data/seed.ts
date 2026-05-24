// Sample Lapo Oase data used to seed localStorage on the first browser visit.
import type { InventoryItem, Order } from "@/types/pos";

export const sampleOrders: Order[] = [
  {
    id: "order-1001",
    createdAt: new Date().toISOString(),
    orderNumber: "1001",
    customerName: "Maya",
    items: [{ name: "Manuk Napinadar", qty: 2, price: 12.5 }],
    notes: "Extra andaliman",
    status: "new",
    total: 7.5
  },
  {
    id: "order-1002",
    createdAt: new Date().toISOString(),
    orderNumber: "1002",
    customerName: "Jo",
    items: [{ name: "Mie Gomak", qty: 1, price: 8.75 }],
    notes: "Medium spice",
    status: "preparing",
    total: 8.5
  },
  {
    id: "order-1003",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    orderNumber: "0998",
    customerName: "Luis",
    items: [{ name: "Saksang", qty: 3, price: 11.5 }],
    notes: "",
    status: "done",
    total: 12.75
  }
];

export const sampleInventory: InventoryItem[] = [
  { id: "inv-andaliman", name: "Andaliman", stock: 6, unit: "kg" },
  { id: "inv-arsik-spice", name: "Bumbu arsik", stock: 10, unit: "packs" },
  { id: "inv-mie-lidi", name: "Mie lidi gomak", stock: 18, unit: "kg" },
  { id: "inv-chicken", name: "Free-range chicken", stock: 14, unit: "kg" },
  { id: "inv-goldfish", name: "Ikan mas", stock: 12, unit: "kg" },
  { id: "inv-sambal", name: "Sambal tuk-tuk", stock: 8, unit: "jars" }
];
