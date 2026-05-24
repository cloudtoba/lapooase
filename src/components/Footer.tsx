import { DatabaseZap, Smartphone } from "lucide-react";

// Simple footer that reminds staff the Lapo Oase MVP is local-device only.
export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="section py-8">
        <div className="grid gap-5 text-sm text-muted md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-lg font-black text-ink">Lapo Oase MVP</p>
            <p className="mt-1">Batak food orders, kitchen status, reports, and inventory saved in this browser.</p>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <Smartphone className="h-4 w-4 text-ocean" aria-hidden="true" />
            Installable PWA
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <DatabaseZap className="h-4 w-4 text-basil" aria-hidden="true" />
            No paid backend
          </div>
        </div>
      </div>
    </footer>
  );
}
