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
  date_trunc('month', created_at at time zone 'Asia/Jakarta')::date as order_month_wib
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
  i.sort_order
from public.pos_order_items i
join public.pos_orders o on o.id = i.order_id;

grant select on public.pos_orders_analytics to anon, authenticated;
grant select on public.pos_order_items_analytics to anon, authenticated;
