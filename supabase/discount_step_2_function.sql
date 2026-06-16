create or replace function public.create_pos_order(order_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $create_pos_order$
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
$create_pos_order$;

grant execute on function public.create_pos_order(jsonb) to anon, authenticated;
