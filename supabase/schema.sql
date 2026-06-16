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

create table if not exists public.pos_orders (
  id text primary key,
  created_at timestamptz not null default now(),
  order_number text not null,
  customer_name text,
  notes text,
  status text not null default 'new' check (status in ('new', 'preparing', 'done')),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount_type text not null default 'none' check (discount_type in ('none', 'opening_10', 'google_review_20', 'custom')),
  discount_label text,
  discount_rate numeric(6, 4) not null default 0 check (discount_rate >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total numeric(12, 2) not null check (total >= 0)
);

create table if not exists public.pos_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.pos_orders(id) on delete cascade,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  category text,
  notes text,
  gross_line_total numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  net_line_total numeric(12, 2) not null default 0,
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
  insert into public.pos_orders (
    id,
    created_at,
    order_number,
    customer_name,
    notes,
    status,
    subtotal,
    discount_type,
    discount_label,
    discount_rate,
    discount_amount,
    total
  )
  values (
    order_payload->>'id',
    coalesce((order_payload->>'created_at')::timestamptz, now()),
    order_payload->>'order_number',
    nullif(order_payload->>'customer_name', ''),
    nullif(order_payload->>'notes', ''),
    coalesce(order_payload->>'status', 'new'),
    coalesce((order_payload->>'subtotal')::numeric, (order_payload->>'total')::numeric, 0),
    coalesce(order_payload->>'discount_type', 'none'),
    nullif(order_payload->>'discount_label', ''),
    coalesce((order_payload->>'discount_rate')::numeric, 0),
    coalesce((order_payload->>'discount_amount')::numeric, 0),
    coalesce((order_payload->>'total')::numeric, 0)
  );

  insert into public.pos_order_items (
    order_id,
    name,
    quantity,
    unit_price,
    category,
    notes,
    gross_line_total,
    discount_amount,
    net_line_total,
    sort_order
  )
  select
    order_payload->>'id',
    item->>'name',
    coalesce((item->>'quantity')::integer, 1),
    coalesce((item->>'unit_price')::numeric, 0),
    nullif(item->>'category', ''),
    nullif(item->>'notes', ''),
    coalesce((item->>'gross_line_total')::numeric, coalesce((item->>'quantity')::integer, 1) * coalesce((item->>'unit_price')::numeric, 0)),
    coalesce((item->>'discount_amount')::numeric, 0),
    coalesce((item->>'net_line_total')::numeric, coalesce((item->>'quantity')::integer, 1) * coalesce((item->>'unit_price')::numeric, 0)),
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

create or replace view public.pos_orders_analytics as
select
  id,
  order_number,
  customer_name,
  status,
  total,
  created_at,
  created_at at time zone 'Asia/Jakarta' as created_at_wib,
  (created_at at time zone 'Asia/Jakarta')::date as order_date_wib,
  date_trunc('month', created_at at time zone 'Asia/Jakarta')::date as order_month_wib,
  to_char(created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS') as created_at_wib_text,
  date_trunc('hour', created_at at time zone 'Asia/Jakarta') as order_hour_wib,
  subtotal,
  discount_type,
  discount_label,
  discount_rate,
  discount_amount
from public.pos_orders;

create or replace view public.pos_order_items_analytics as
select
  i.id,
  i.order_id,
  o.order_number,
  o.status,
  o.created_at,
  o.created_at at time zone 'Asia/Jakarta' as created_at_wib,
  (o.created_at at time zone 'Asia/Jakarta')::date as order_date_wib,
  date_trunc('month', o.created_at at time zone 'Asia/Jakarta')::date as order_month_wib,
  i.name,
  i.quantity,
  i.unit_price,
  i.quantity * i.unit_price as line_total,
  i.notes,
  i.sort_order,
  o.customer_name,
  o.total as order_total,
  to_char(o.created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS') as created_at_wib_text,
  date_trunc('hour', o.created_at at time zone 'Asia/Jakarta') as order_hour_wib,
  i.category,
  i.gross_line_total,
  i.discount_amount,
  i.net_line_total,
  o.discount_type,
  o.discount_label
from public.pos_order_items i
join public.pos_orders o on o.id = i.order_id;

create or replace view public.pos_order_details_analytics as
select
  o.id,
  o.order_number,
  o.customer_name,
  o.status,
  o.total,
  o.created_at,
  o.created_at at time zone 'Asia/Jakarta' as created_at_wib,
  to_char(o.created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS') as created_at_wib_text,
  string_agg(
    concat(i.quantity, 'x ', i.name, ' @ Rp', trim(to_char(i.unit_price, 'FM999G999G999G999'))),
    E'\n'
    order by i.sort_order, i.name
  ) as items,
  string_agg(
    concat(i.quantity, 'x ', i.name, ' = Rp', trim(to_char(i.quantity * i.unit_price, 'FM999G999G999G999'))),
    E'\n'
    order by i.sort_order, i.name
  ) as item_totals
from public.pos_orders o
left join public.pos_order_items i on i.order_id = o.id
group by o.id, o.order_number, o.customer_name, o.status, o.total, o.created_at;

grant select on public.pos_orders_analytics to anon, authenticated;
grant select on public.pos_order_items_analytics to anon, authenticated;
grant select on public.pos_order_details_analytics to anon, authenticated;
