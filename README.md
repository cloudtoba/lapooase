# Lapo Oase POS

Local-storage-first POS MVP for a Batak food lapo serving dishes like Manuk Napinadar, Mie Gomak, Saksang, Arsik, and Sambal Tuk-tuk.

Built with:
- Next.js App Router + TypeScript
- Tailwind CSS
- Local browser storage for orders and inventory
- PWA manifest, icons, and service worker for Android Chrome installability
- Tablet-friendly pages for Orders, Kitchen, Reports, and Inventory

## Project Structure

```text
src/app/page.tsx              Home dashboard and navigation
src/app/orders/page.tsx       Add orders and view saved tickets
src/app/kitchen/page.tsx      Update order status
src/app/reports/page.tsx      Daily sales and best-seller summary
src/app/inventory/page.tsx    Stock list and quantity updates
src/components/pos/           Reusable POS provider, lists, badges, and cards
src/data/seed.ts              Sample Batak food orders and inventory
src/lib/pos-storage.ts        localStorage load/save helpers
public/manifest.webmanifest   PWA install metadata
public/sw.js                  Minimal service worker
```

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Open [Vercel](https://vercel.com) and choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the framework preset as **Next.js**.
5. Leave environment variables empty for this local-first MVP.
6. Click **Deploy**.

On Android Chrome, open the deployed URL and choose **Install app** or **Add to Home screen** from the browser menu.
