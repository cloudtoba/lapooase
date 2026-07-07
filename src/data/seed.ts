// Sample Lapo Oase data used to seed localStorage on the first browser visit.
import type { Expense, InventoryItem, Order } from "@/types/pos";

export const sampleOrders: Order[] = [
  {
    id: "order-1001",
    createdAt: new Date().toISOString(),
    orderNumber: "1001",
    customerName: "Maya",
    items: [{ name: "Kari - Mie Gomak", qty: 2, price: 35000 }],
    notes: "Extra andaliman",
    status: "new",
    total: 70000
  },
  {
    id: "order-1002",
    createdAt: new Date().toISOString(),
    orderNumber: "1002",
    customerName: "Jo",
    items: [{ name: "Ngarok Siak Tolu - Ayam", qty: 1, price: 48000 }],
    notes: "Medium spice",
    status: "preparing",
    total: 48000
  },
  {
    id: "order-1003",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    orderNumber: "0998",
    customerName: "Luis",
    items: [{ name: "Kopi - Gula Aren - Dingin", qty: 3, price: 27000 }],
    notes: "",
    status: "done",
    total: 81000
  }
];

export const sampleInventory: InventoryItem[] = [
  { id: "inv-andaliman", name: "Andaliman", stock: 6, unit: "kg" },
  { id: "inv-arsik-spice", name: "Bumbu arsik", stock: 10, unit: "packs" },
  { id: "inv-mie-lidi", name: "Mie lidi gomak", stock: 18, unit: "kg" },
  { id: "inv-chicken", name: "Free-range chicken", stock: 14, unit: "kg" },
  { id: "inv-goldfish", name: "Ikan mas", stock: 12, unit: "kg" },
  { id: "inv-sambal", name: "Sambal tuk-tuk", stock: 8, unit: "jars" },
  { id: "inv-indomie", name: "Indomie", stock: 80, unit: "packs" },
  { id: "inv-telor", name: "Telor", stock: 90, unit: "pcs" },
  { id: "inv-kopi", name: "Kopi", stock: 8, unit: "kg" },
  { id: "inv-susu", name: "Susu", stock: 24, unit: "cans" },
  { id: "inv-tuak", name: "Tuak", stock: 30, unit: "bottles" }
];

export const sampleExpenses: Expense[] = [
  {
    id: "expense-1001",
    createdAt: new Date().toISOString(),
    expenseDate: new Date().toISOString().slice(0, 10),
    description: "Gas 10 tabung",
    category: "Gas",
    amount: 170000,
    paymentMethod: "Cash"
  },
  {
    id: "expense-1002",
    createdAt: new Date().toISOString(),
    expenseDate: new Date().toISOString().slice(0, 10),
    description: "Susu UHT 2 kotak",
    category: "Bahan Baku",
    amount: 44000,
    paymentMethod: "Cash"
  }
];
