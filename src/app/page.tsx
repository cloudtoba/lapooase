import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ClipboardList, Package, ReceiptText, WalletCards } from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description: "Lapo Oase POS navigation for orders, kitchen, reports, and inventory."
};

const destinations = [
  { href: "/orders", label: "Orders", description: "Create Batak food orders and review saved tickets.", icon: ReceiptText },
  { href: "/kitchen", label: "Kitchen", description: "Move tickets from new to preparing to done.", icon: ClipboardList },
  { href: "/expenses", label: "Expenses", description: "Record daily cash-out items and supplier purchases.", icon: WalletCards },
  { href: "/reports", label: "Reports", description: "Check today sales, counts by day, and best sellers.", icon: BarChart3 },
  { href: "/inventory", label: "Inventory", description: "Update stock quantities for Batak kitchen supplies.", icon: Package }
];

// Home page route hub for the four MVP workflows.
export default function HomePage() {
  return (
    <section className="section">
      <div className="mb-8 rounded-lg border border-ink/10 bg-white p-5 shadow-panel sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean">Lapo counter</p>
        <h1 className="mt-2 text-4xl font-black text-ink sm:text-5xl">Lapo Oase</h1>
        <p className="mt-1 text-3xl font-semibold leading-tight text-tomato sm:text-4xl" lang="bbc">
          ᯞᯇᯬ ᯀᯬᯀᯘᯩ
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted sm:text-base">
          A simple local-first POS for Batak dishes like Manuk Napinadar, Mie Gomak, Saksang, Arsik, and
          Sambal Tuk-tuk.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {destinations.map((destination) => (
          <Link key={destination.href} href={destination.href} className="focus-ring app-panel p-5 hover:-translate-y-0.5 hover:shadow-lg">
            <destination.icon className="h-8 w-8 text-tomato" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">{destination.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{destination.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
