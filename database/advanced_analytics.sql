-- Advanced analytics extension for HAIR-SALON
-- Run this migration in the Supabase SQL editor after the existing schema.

create table if not exists hair_salon.appointments(
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references hair_salon.outlets(id),
  customer_id uuid not null references hair_salon.customers(id),
  staff_id uuid references hair_salon.users(id),
  service_id uuid references hair_salon.services(id),
  scheduled_at timestamptz not null,
  status text not null default 'booked' check(status in ('booked','confirmed','arrived','completed','cancelled','no_show','rescheduled')),
  source text not null default 'walk_in' check(source in ('walk_in','phone','whatsapp','website','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_outlet_date_idx on hair_salon.appointments(outlet_id, scheduled_at desc);
create index if not exists appointments_customer_date_idx on hair_salon.appointments(customer_id, scheduled_at desc);

create table if not exists hair_salon.service_costs(
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references hair_salon.services(id) on delete cascade,
  product_cost numeric(10,2) not null default 0 check(product_cost >= 0),
  other_cost numeric(10,2) not null default 0 check(other_cost >= 0),
  effective_from date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists hair_salon.inventory_items(
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references hair_salon.outlets(id),
  name text not null,
  unit text not null default 'unit',
  quantity numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 0,
  unit_cost numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists hair_salon.inventory_movements(
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references hair_salon.inventory_items(id) on delete cascade,
  quantity_change numeric(12,2) not null,
  reason text not null,
  transaction_id uuid references hair_salon.transactions(id),
  created_at timestamptz not null default now()
);

create index if not exists inventory_outlet_idx on hair_salon.inventory_items(outlet_id, active);
create index if not exists inventory_movements_item_idx on hair_salon.inventory_movements(inventory_item_id, created_at desc);

alter table hair_salon.transactions add column if not exists discount_amount numeric(10,2) not null default 0 check(discount_amount >= 0);
alter table hair_salon.transactions add column if not exists gross_amount numeric(10,2);
alter table hair_salon.transactions add column if not exists completed_at timestamptz;

update hair_salon.transactions
set gross_amount = coalesce(gross_amount, amount_paid + discount_amount),
    completed_at = coalesce(completed_at, served_at)
where gross_amount is null or completed_at is null;

-- Safe customer analytics view. It only aggregates existing transaction data.
create or replace view hair_salon.customer_analytics as
select
  c.id as customer_id,
  c.outlet_id,
  c.name,
  count(t.id)::int as visits,
  coalesce(sum(t.amount_paid),0)::numeric(12,2) as lifetime_spend,
  case when count(t.id) > 0 then round((sum(t.amount_paid) / count(t.id))::numeric,2) else 0 end as avg_bill,
  max(t.served_at) as last_visit,
  min(t.served_at) as first_visit
from hair_salon.customers c
left join hair_salon.transactions t on t.customer_id = c.id
  and t.outlet_id = c.outlet_id
group by c.id, c.outlet_id, c.name;
