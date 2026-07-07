import Link from "next/link";
import { BarChart3, ClipboardList, Home, Package, ReceiptText, Utensils, WalletCards } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/kitchen", label: "Kitchen", icon: ClipboardList },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/inventory", label: "Inventory", icon: Package }
];

const batakName = "ᯞᯇᯬ ᯀᯬᯀᯘᯩ";

// Top navigation for the tablet-friendly Lapo Oase POS routes.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-tomato text-white">
            <Utensils className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-black leading-none">Lapo Oase</span>
            <span className="block text-sm font-semibold leading-tight text-tomato" lang="bbc">
              {batakName}
            </span>
            <span className="block text-xs font-semibold text-muted">Batak food POS</span>
          </span>
        </Link>

        <ul className="grid grid-cols-3 gap-1 text-xs font-semibold text-muted sm:grid-cols-6 sm:text-sm md:flex md:items-center md:gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="focus-ring flex flex-col items-center gap-1 rounded-md px-2 py-2 hover:bg-white hover:text-ink md:flex-row md:px-3"
              >
                <link.icon className="h-4 w-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
