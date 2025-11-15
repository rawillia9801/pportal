alter table public.puppy_buyers
  add column if not exists address_line1 text,
  add column if not exists postal_code text,
  add column if not exists notes text,
  add column if not exists base_price numeric,
  add column if not exists credits numeric,
  add column if not exists admin_fee_financing numeric,
  add column if not exists source text,
  add column if not exists on_payment_plan boolean,
  add column if not exists plan_start_date date,
  add column if not exists plan_due_day integer,
  add column if not exists plan_status text,
  add column if not exists plan_min_payment numeric;
