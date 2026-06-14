# Lapo Oase POS

Supabase-backed POS MVP for a Batak food lapo serving dishes like Manuk Napinadar, Mie Gomak, Saksang, Arsik, and Sambal Tuk-tuk.

Built with:
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase for POS orders and inventory, with local browser storage as a development fallback
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
src/lib/pos-storage.ts        Supabase/local fallback load/save helpers
public/manifest.webmanifest   PWA install metadata
public/sw.js                  Minimal service worker
```

## Supabase Setup

1. Open your Supabase project SQL Editor.
2. Run the SQL in `supabase/schema.sql`, or run the migration file `supabase/migrations/20260614120000_create_pos_tables.sql` if the older public-order tables already exist.
3. Add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ivfouymgznoggwiyrtjs.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
LAPO_POS_USERNAME=your-staff-username
LAPO_POS_PASSWORD=your-staff-password
```

The staff POS uses `pos_orders`, `pos_order_items`, and `inventory_items`. The older public checkout flow still uses `orders` and `order_items`.

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
5. Add the Supabase and POS login environment variables from the setup section.
6. Click **Deploy**.

On Android Chrome, open the deployed URL and choose **Install app** or **Add to Home screen** from the browser menu.
