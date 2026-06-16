alter table public.pos_orders
add column if not exists subtotal numeric(12, 2) not null default 0,
add column if not exists discount_type text not null default 'none',
add column if not exists discount_label text,
add column if not exists discount_rate numeric(6, 4) not null default 0,
add column if not exists discount_amount numeric(12, 2) not null default 0;

alter table public.pos_orders
drop constraint if exists pos_orders_discount_type_check;

alter table public.pos_orders
add constraint pos_orders_discount_type_check
check (discount_type in ('none', 'opening_10', 'google_review_20', 'custom'));

update public.pos_orders
set subtotal = total
where subtotal = 0 and total > 0;

alter table public.pos_order_items
add column if not exists category text,
add column if not exists gross_line_total numeric(12, 2) not null default 0,
add column if not exists discount_amount numeric(12, 2) not null default 0,
add column if not exists net_line_total numeric(12, 2) not null default 0;

update public.pos_order_items
set
  gross_line_total = quantity * unit_price,
  net_line_total = quantity * unit_price
where gross_line_total = 0 and net_line_total = 0;

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
