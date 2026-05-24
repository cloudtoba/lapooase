import type { Metadata, Viewport } from "next";
import { POSProvider } from "@/components/pos/POSProvider";
import { PWARegister } from "@/components/pos/PWARegister";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

// Root shell for Lapo Oase POS. It attaches PWA metadata and the client-side localStorage provider.
export const metadata: Metadata = {
  metadataBase: new URL("https://lapo-oase.local"),
  title: {
    default: "Lapo Oase",
    template: "%s | Lapo Oase"
  },
  description: "A local-storage-first Batak food point of sale MVP for orders, kitchen, reports, and inventory.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Lapo Oase",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <POSProvider>
          <PWARegister />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </POSProvider>
      </body>
    </html>
  );
}
