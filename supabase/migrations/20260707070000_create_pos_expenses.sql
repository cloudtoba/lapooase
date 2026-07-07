create table if not exists public.pos_expenses (
  id text primary key,
  created_at timestamptz not null default now(),
  expense_date date not null default ((now() at time zone 'Asia/Jakarta')::date),
  description text not null,
  category text not null check (category in ('Bahan Baku', 'Gas', 'Listrik', 'Gaji', 'Sewa', 'Peralatan', 'Maintenance', 'Lainnya')),
  amount numeric(12, 2) not null check (amount >= 0),
  payment_method text not null default 'Cash' check (payment_method in ('Cash', 'QRIS', 'Transfer', 'Kartu')),
  vendor text,
  notes text
);

alter table public.pos_expenses enable row level security;

drop policy if exists "POS can read expenses" on public.pos_expenses;
drop policy if exists "POS can create expenses" on public.pos_expenses;

create policy "POS can read expenses"
on public.pos_expenses
for select
to anon, authenticated
using (true);

create policy "POS can create expenses"
on public.pos_expenses
for insert
to anon, authenticated
with check (true);

create index if not exists pos_expenses_expense_date_idx on public.pos_expenses(expense_date desc);
create index if not exists pos_expenses_created_at_idx on public.pos_expenses(created_at desc);
create index if not exists pos_expenses_category_idx on public.pos_expenses(category);

create or replace view public.pos_expenses_analytics as
select
  id,
  created_at,
  created_at at time zone 'Asia/Jakarta' as created_at_wib,
  to_char(created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS') as created_at_wib_text,
  expense_date,
  expense_date as expense_date_wib,
  date_trunc('month', expense_date)::date as expense_month_wib,
  description,
  category,
  amount,
  payment_method,
  vendor,
  notes
from public.pos_expenses;

create or replace view public.pos_cash_daily_analytics as
with sales as (
  select
    order_date_wib as cash_date,
    coalesce(sum(total), 0) as sales
  from public.pos_orders_analytics
  group by order_date_wib
),
expenses as (
  select
    expense_date_wib as cash_date,
    coalesce(sum(amount), 0) as expenses
  from public.pos_expenses_analytics
  group by expense_date_wib
)
select
  coalesce(s.cash_date, e.cash_date) as cash_date,
  coalesce(s.sales, 0) as sales,
  coalesce(e.expenses, 0) as expenses,
  coalesce(s.sales, 0) - coalesce(e.expenses, 0) as net_cash
from sales s
full outer join expenses e on e.cash_date = s.cash_date;

grant select on public.pos_expenses_analytics to anon, authenticated;
grant select on public.pos_cash_daily_analytics to anon, authenticated;
