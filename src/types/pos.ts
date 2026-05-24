// Shared POS data contracts used by local storage, forms, reports, and inventory screens.
export type OrderStatus = "new" | "preparing" | "done";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  createdAt: string;
  orderNumber: string;
  customerName?: string;
  items: OrderItem[];
  notes?: string;
  status: OrderStatus;
  total: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  unit: string;
};
