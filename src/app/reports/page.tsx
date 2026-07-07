"use client";

// Reports screen: derives daily sales and item summaries from saved POS orders.
import { PageHeader } from "@/components/pos/PageHeader";
import { StatCard } from "@/components/pos/StatCard";
import { usePOS } from "@/components/pos/POSProvider";
import { formatIDR } from "@/lib/currency";
import { downloadDailyReportPdf } from "@/lib/report-pdf";
import { formatJakartaDate, formatJakartaDateShort, jakartaDayKey } from "@/lib/timezone";

function dateKey(value: string) {
  return formatJakartaDateShort(value);
}

function isToday(value: string) {
  return jakartaDayKey(value) === jakartaDayKey(new Date());
}

export default function ReportsPage() {
  const { expenses, isReady, orders } = usePOS();
  const todayOrders = orders.filter((order) => isToday(order.createdAt));
  const todayExpenses = expenses.filter((expense) => isToday(`${expense.expenseDate}T00:00:00`));
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const todayExpenseTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayNetCash = todaySales - todayExpenseTotal;
  const countByDay = orders.reduce<Record<string, number>>((days, order) => {
    const key = dateKey(order.createdAt);
    days[key] = (days[key] ?? 0) + 1;
    return days;
  }, {});
  const itemCounts = orders.reduce<Record<string, number>>((items, order) => {
    order.items.forEach((item) => {
      items[item.name] = (items[item.name] ?? 0) + item.qty;
    });
    return items;
  }, {});
  const bestSellingItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
  const todayLabel = formatJakartaDate(new Date());

  return (
    <section className="section">
      <PageHeader
        eyebrow="Lapo numbers"
        title="Reports"
        description="A lightweight readout from saved order history, enough for an MVP daily check-in."
      />

      {isReady ? (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                downloadDailyReportPdf({
                  dateLabel: todayLabel,
                  totalOrders: todayOrders.length,
                  totalSales: todaySales,
                  bestSellingItem,
                  orders: todayOrders
                })
              }
              className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato"
            >
              Download PDF
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total orders today" value={String(todayOrders.length)} />
            <StatCard label="Total sales today" value={formatIDR(todaySales)} />
            <StatCard label="Expenses today" value={formatIDR(todayExpenseTotal)} />
            <StatCard label="Net cash today" value={formatIDR(todayNetCash)} />
            <StatCard label="Best-selling item" value={bestSellingItem ? bestSellingItem[0] : "None"} />
            <StatCard label="Best-selling qty" value={bestSellingItem ? String(bestSellingItem[1]) : "0"} />
          </div>

          <div className="app-panel mt-6 overflow-hidden">
            <div className="border-b border-ink/10 p-5">
              <h2 className="text-xl font-black">Order count by day</h2>
            </div>
            <div className="divide-y divide-ink/10">
              {Object.entries(countByDay).map(([day, count]) => (
                <div key={day} className="flex items-center justify-between gap-4 p-5">
                  <span className="font-bold">{day}</span>
                  <span className="rounded-md bg-fog px-3 py-1 text-sm font-black">{count} orders</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="app-panel p-6 text-sm font-semibold text-muted">Loading reports...</div>
      )}
    </section>
  );
}
