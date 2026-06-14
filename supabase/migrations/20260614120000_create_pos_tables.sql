create extension if not exists pgcrypto;

create table if not exists public.pos_orders (
  id text primary key,
  created_at timestamptz not null default now(),
  order_number text not null,
  customer_name text,
  notes text,
  status text not null default 'new' check (status in ('new', 'preparing', 'done')),
  total numeric(12, 2) not null check (total >= 0)
);

create table if not exists public.pos_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.pos_orders(id) on delete cascade,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id text primary key,
  name text not null,
  stock numeric(12, 2) not null default 0 check (stock >= 0),
  unit text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row
execute function public.set_updated_at();

insert into public.inventory_items (id, name, stock, unit)
values
  ('inv-andaliman', 'Andaliman', 6, 'kg'),
  ('inv-arsik-spice', 'Bumbu arsik', 10, 'packs'),
  ('inv-mie-lidi', 'Mie lidi gomak', 18, 'kg'),
  ('inv-chicken', 'Free-range chicken', 14, 'kg'),
  ('inv-goldfish', 'Ikan mas', 12, 'kg'),
  ('inv-sambal', 'Sambal tuk-tuk', 8, 'jars'),
  ('inv-indomie', 'Indomie', 80, 'packs'),
  ('inv-telor', 'Telor', 90, 'pcs'),
  ('inv-kopi', 'Kopi', 8, 'kg'),
  ('inv-susu', 'Susu', 24, 'cans'),
  ('inv-tuak', 'Tuak', 30, 'bottles')
on conflict (id) do nothing;

create or replace function public.create_pos_order(order_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pos_orders (id, created_at, order_number, customer_name, notes, status, total)
  values (
    order_payload->>'id',
    coalesce((order_payload->>'created_at')::timestamptz, now()),
    order_payload->>'order_number',
    nullif(order_payload->>'customer_name', ''),
    nullif(order_payload->>'notes', ''),
    coalesce(order_payload->>'status', 'new'),
    coalesce((order_payload->>'total')::numeric, 0)
  );

  insert into public.pos_order_items (order_id, name, quantity, unit_price, notes, sort_order)
  select
    order_payload->>'id',
    item->>'name',
    coalesce((item->>'quantity')::integer, 1),
    coalesce((item->>'unit_price')::numeric, 0),
    nullif(item->>'notes', ''),
    coalesce((item->>'sort_order')::integer, 0)
  from jsonb_array_elements(coalesce(order_payload->'items', '[]'::jsonb)) as item;
end;
$$;

grant execute on function public.create_pos_order(jsonb) to anon, authenticated;

alter table public.pos_orders enable row level security;
alter table public.pos_order_items enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists "POS can read orders" on public.pos_orders;
drop policy if exists "POS can create orders" on public.pos_orders;
drop policy if exists "POS can update order status" on public.pos_orders;
drop policy if exists "POS can read order items" on public.pos_order_items;
drop policy if exists "POS can create order items" on public.pos_order_items;
drop policy if exists "POS can read inventory" on public.inventory_items;
drop policy if exists "POS can create inventory" on public.inventory_items;
drop policy if exists "POS can update inventory" on public.inventory_items;

create policy "POS can read orders"
on public.pos_orders
for select
to anon, authenticated
using (true);

create policy "POS can create orders"
on public.pos_orders
for insert
to anon, authenticated
with check (true);

create policy "POS can update order status"
on public.pos_orders
for update
to anon, authenticated
using (true)
with check (status in ('new', 'preparing', 'done'));

create policy "POS can read order items"
on public.pos_order_items
for select
to anon, authenticated
using (true);

create policy "POS can create order items"
on public.pos_order_items
for insert
to anon, authenticated
with check (true);

create policy "POS can read inventory"
on public.inventory_items
for select
to anon, authenticated
using (true);

create policy "POS can create inventory"
on public.inventory_items
for insert
to anon, authenticated
with check (true);

create policy "POS can update inventory"
on public.inventory_items
for update
to anon, authenticated
using (true)
with check (stock >= 0);

create index if not exists pos_orders_created_at_idx on public.pos_orders(created_at desc);
create index if not exists pos_orders_status_idx on public.pos_orders(status);
create index if not exists pos_order_items_order_id_idx on public.pos_order_items(order_id);
