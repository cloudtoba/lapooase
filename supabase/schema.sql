create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text,
  fulfillment_type text not null check (fulfillment_type in ('delivery', 'pickup')),
  status text not null default 'received',
  subtotal numeric(10, 2) not null,
  tax numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null,
  total numeric(10, 2) not null,
  notes text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Users can view their orders" on public.orders;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Users can view their order items" on public.order_items;

create policy "Anyone can create orders"
on public.orders
for insert
to anon, authenticated
with check (user_id is null or auth.uid() = user_id);

create policy "Users can view their orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Anyone can create order items"
on public.order_items
for insert
to anon, authenticated
with check (true);

create policy "Users can view their order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
