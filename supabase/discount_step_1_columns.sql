alter table public.pos_orders
add column if not exists subtotal numeric(12, 2) not null default 0;

alter table public.pos_orders
add column if not exists discount_type text not null default 'none';

alter table public.pos_orders
add column if not exists discount_label text;

alter table public.pos_orders
add column if not exists discount_rate numeric(6, 4) not null default 0;

alter table public.pos_orders
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
add column if not exists category text;

alter table public.pos_order_items
add column if not exists gross_line_total numeric(12, 2) not null default 0;

alter table public.pos_order_items
add column if not exists discount_amount numeric(12, 2) not null default 0;

alter table public.pos_order_items
add column if not exists net_line_total numeric(12, 2) not null default 0;

update public.pos_order_items
set
  gross_line_total = quantity * unit_price,
  net_line_total = quantity * unit_price
where gross_line_total = 0 and net_line_total = 0;
