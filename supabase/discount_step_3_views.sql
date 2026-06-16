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

grant select on public.pos_orders_analytics to anon, authenticated;
grant select on public.pos_order_items_analytics to anon, authenticated;
