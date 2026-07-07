"use client";

// Expenses screen: records daily cash-out items so reports and Grafana can calculate net cash.
import { FormEvent, useMemo, useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";
import { formatIDR } from "@/lib/currency";
import { formatJakartaDateShort, jakartaDayKey } from "@/lib/timezone";
import type { Expense, PaymentMethod } from "@/types/pos";

const paymentMethods: PaymentMethod[] = ["Cash", "QRIS", "Transfer", "Kartu"];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function isToday(value: string) {
  return jakartaDayKey(`${value}T00:00:00`) === jakartaDayKey(new Date());
}

export default function ExpensesPage() {
  const { addExpense, expenses, isReady } = usePOS();
  const [expenseDate, setExpenseDate] = useState(todayInputValue());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");

  const todayExpenses = useMemo(() => expenses.filter((expense) => isToday(expense.expenseDate)), [expenses]);
  const totalToday = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSelectedDay = expenses
    .filter((expense) => expense.expenseDate === expenseDate)
    .reduce((sum, expense) => sum + expense.amount, 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      expenseDate,
      description: description.trim(),
      category: "Lainnya",
      amount: numericAmount,
      paymentMethod
    };

    addExpense(expense);
    setDescription("");
    setAmount("");
  }

  return (
    <section className="section">
      <PageHeader
        eyebrow="Cash out"
        title="Expenses"
        description="Catat pengeluaran harian supaya kas terlihat otomatis dari sales dikurangi expenses."
      />

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form onSubmit={handleSubmit} className="app-panel space-y-4 p-5">
          <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ocean text-white">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-black">Add expense</h2>
              <p className="text-sm font-semibold text-muted">Ketik item pengeluaran dan jumlahnya.</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="expenseDate">
              Date
            </label>
            <input
              id="expenseDate"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="description">
              Item pengeluaran
            </label>
            <input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: Bandrek 1.2 Kg"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="amount">
              Amount
            </label>
            <input
              id="amount"
              min={1}
              inputMode="numeric"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Example: 156000"
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="paymentMethod">
              Payment method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save expense
          </button>
        </form>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="app-panel p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Expenses today</p>
              <p className="mt-2 text-3xl font-black">{formatIDR(totalToday)}</p>
            </div>
            <div className="app-panel p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Selected date total</p>
              <p className="mt-2 text-3xl font-black">{formatIDR(totalSelectedDay)}</p>
            </div>
          </div>

          <div className="app-panel overflow-hidden">
            <div className="border-b border-ink/10 p-5">
              <h2 className="text-xl font-black">Recent expenses</h2>
            </div>
            {isReady ? (
              <div className="divide-y divide-ink/10">
                {expenses.length ? (
                  expenses.slice(0, 30).map((expense) => (
                    <div key={expense.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-black">{expense.description}</p>
                        <p className="mt-1 text-sm font-semibold text-muted">
                          {formatJakartaDateShort(`${expense.expenseDate}T00:00:00`)} · {expense.paymentMethod}
                        </p>
                      </div>
                      <p className="text-lg font-black">{formatIDR(expense.amount)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm font-semibold text-muted">No expenses recorded yet.</div>
                )}
              </div>
            ) : (
              <div className="p-6 text-sm font-semibold text-muted">Loading expenses...</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
