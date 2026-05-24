// Reusable summary tile for report metrics.
export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-panel p-5">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}
