"use client";

// React context for the whole POS. It keeps state management simple and syncs changes to localStorage.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadInventory, loadOrders, saveInventory, saveOrders } from "@/lib/pos-storage";
import type { InventoryItem, Order, OrderStatus } from "@/types/pos";

type POSContextValue = {
  orders: Order[];
  inventory: InventoryItem[];
  isReady: boolean;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateStock: (id: string, stock: number) => void;
};

const POSContext = createContext<POSContextValue | null>(null);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setOrders(loadOrders());
    setInventory(loadInventory());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      saveOrders(orders);
    }
  }, [isReady, orders]);

  useEffect(() => {
    if (isReady) {
      saveInventory(inventory);
    }
  }, [inventory, isReady]);

  const value = useMemo<POSContextValue>(
    () => ({
      orders,
      inventory,
      isReady,
      addOrder: (order) => setOrders((current) => [order, ...current]),
      updateOrderStatus: (id, status) =>
        setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order))),
      updateStock: (id, stock) =>
        setInventory((current) => current.map((item) => (item.id === id ? { ...item, stock } : item)))
    }),
    [inventory, isReady, orders]
  );

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used inside POSProvider");
  }
  return context;
}
