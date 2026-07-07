"use client";

// React context for the whole POS. It keeps state management simple and syncs changes to Supabase when configured.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addExpenseRemote,
  addOrderRemote,
  getErrorMessage,
  loadExpensesRemote,
  loadInventoryRemote,
  loadOrdersRemote,
  updateOrderStatusRemote,
  updateStockRemote
} from "@/lib/pos-storage";
import type { Expense, InventoryItem, Order, OrderStatus } from "@/types/pos";

type POSContextValue = {
  orders: Order[];
  inventory: InventoryItem[];
  expenses: Expense[];
  isReady: boolean;
  addOrder: (order: Order) => void;
  addExpense: (expense: Expense) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateStock: (id: string, stock: number) => void;
};

const POSContext = createContext<POSContextValue | null>(null);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [ordersResult, inventoryResult, expensesResult] = await Promise.allSettled([loadOrdersRemote(), loadInventoryRemote(), loadExpensesRemote()]);

      if (isMounted) {
        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value);
        } else {
          console.error(`Failed to load orders: ${getErrorMessage(ordersResult.reason)}`, ordersResult.reason);
        }

        if (inventoryResult.status === "fulfilled") {
          setInventory(inventoryResult.value);
        } else {
          console.error(`Failed to load inventory: ${getErrorMessage(inventoryResult.reason)}`, inventoryResult.reason);
        }

        if (expensesResult.status === "fulfilled") {
          setExpenses(expensesResult.value);
        } else {
          console.error(`Failed to load expenses: ${getErrorMessage(expensesResult.reason)}`, expensesResult.reason);
        }

        setIsReady(true);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<POSContextValue>(
    () => ({
      orders,
      inventory,
      expenses,
      isReady,
      addOrder: (order) => {
        setOrders((current) => [order, ...current]);
        void addOrderRemote(order).catch((error) => {
          console.error(`Failed to save order: ${getErrorMessage(error)}`, error);
        });
      },
      addExpense: (expense) => {
        setExpenses((current) => [expense, ...current]);
        void addExpenseRemote(expense).catch((error) => {
          console.error(`Failed to save expense: ${getErrorMessage(error)}`, error);
        });
      },
      updateOrderStatus: (id, status) => {
        const nextOrders = orders.map((order) => (order.id === id ? { ...order, status } : order));
        setOrders(nextOrders);
        void updateOrderStatusRemote(id, status, nextOrders).catch((error) => {
          console.error(`Failed to update order status: ${getErrorMessage(error)}`, error);
        });
      },
      updateStock: (id, stock) => {
        const nextInventory = inventory.map((item) => (item.id === id ? { ...item, stock } : item));
        setInventory(nextInventory);
        void updateStockRemote(id, stock, nextInventory).catch((error) => {
          console.error(`Failed to update inventory stock: ${getErrorMessage(error)}`, error);
        });
      }
    }),
    [expenses, inventory, isReady, orders]
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
