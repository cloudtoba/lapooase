"use client";

// Inventory screen: stock counts are editable and persisted in localStorage.
import { PageHeader } from "@/components/pos/PageHeader";
import { usePOS } from "@/components/pos/POSProvider";

export default function InventoryPage() {
  const { inventory, isReady, updateStock } = usePOS();

  return (
    <section className="section">
      <PageHeader
        eyebrow="Back of house"
        title="Inventory"
        description="Keep simple stock quantities for Batak kitchen ingredients and supplies. Changes save automatically in this browser."
      />

      <div className="app-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_90px] gap-3 border-b border-ink/10 bg-fog/70 px-4 py-3 text-sm font-black text-muted sm:grid-cols-[1fr_160px_120px]">
          <span>Item</span>
          <span>Stock</span>
          <span>Unit</span>
        </div>

        {isReady ? (
          <div className="divide-y divide-ink/10">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_120px_90px] items-center gap-3 px-4 py-4 sm:grid-cols-[1fr_160px_120px]"
              >
                <span className="font-bold">{item.name}</span>
                <input
                  aria-label={`${item.name} stock`}
                  min={0}
                  type="number"
                  value={item.stock}
                  onChange={(event) => updateStock(item.id, Number(event.target.value))}
                  className="focus-ring w-full rounded-md border border-ink/10 bg-white px-3 py-2 font-bold"
                />
                <span className="text-sm font-semibold text-muted">{item.unit}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm font-semibold text-muted">Loading inventory...</div>
        )}
      </div>
    </section>
  );
}
