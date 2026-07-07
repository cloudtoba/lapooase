// Shared POS data contracts used by local storage, forms, reports, and inventory screens.
export type OrderStatus = "new" | "preparing" | "done";
export type DiscountType = "none" | "opening_10" | "google_review_20" | "custom";
export type ExpenseCategory = "Bahan Baku" | "Gas" | "Listrik" | "Gaji" | "Sewa" | "Peralatan" | "Maintenance" | "Lainnya";
export type PaymentMethod = "Cash" | "QRIS" | "Transfer" | "Kartu";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
  category?: string;
  notes?: string;
  grossLineTotal?: number;
  discountAmount?: number;
  netLineTotal?: number;
};

export type Order = {
  id: string;
  createdAt: string;
  orderNumber: string;
  customerName?: string;
  items: OrderItem[];
  notes?: string;
  status: OrderStatus;
  subtotal?: number;
  discountType?: DiscountType;
  discountLabel?: string;
  discountRate?: number;
  discountAmount?: number;
  total: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  unit: string;
};

export type Expense = {
  id: string;
  createdAt: string;
  expenseDate: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  vendor?: string;
  notes?: string;
};
