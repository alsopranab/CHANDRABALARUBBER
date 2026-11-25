-- Chandrabala ERP foundational schema (Supabase/PostgreSQL)
-- This file is a starting schema specification; review and execute only after testing.

create table if not exists erp_assortment_groups (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists erp_families (
  id uuid primary key default gen_random_uuid(),
  assortment_group_id uuid not null references erp_assortment_groups(id),
  code text not null,
  name text not null,
  active boolean not null default true,
  unique (assortment_group_id, code)
);

create table if not exists erp_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references erp_families(id),
  code text unique not null,
  name text not null,
  base_unit text not null default 'kg',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists erp_suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_code text unique,
  name text not null,
  phone text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists erp_warehouses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  address text,
  active boolean not null default true
);

create table if not exists erp_purchase_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_number text unique not null,
  supplier_id uuid references erp_suppliers(id),
  receipt_date date not null default current_date,
  vehicle_number text,
  gross_weight numeric(14,3),
  tare_weight numeric(14,3),
  net_weight numeric(14,3),
  purchase_rate_per_kg numeric(14,4),
  notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists erp_lots (
  id uuid primary key default gen_random_uuid(),
  lot_code text unique not null,
  item_id uuid not null references erp_items(id),
  warehouse_id uuid references erp_warehouses(id),
  source_receipt_id uuid references erp_purchase_receipts(id),
  parent_lot_id uuid references erp_lots(id),
  lot_date date not null default current_date,
  opening_quantity numeric(14,3) not null default 0,
  estimated_cost_per_kg numeric(14,4),
  quality_notes text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists erp_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references erp_lots(id),
  movement_type text not null,
  quantity numeric(14,3) not null,
  unit text not null default 'kg',
  reference_type text,
  reference_id uuid,
  movement_date timestamptz not null default now(),
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  reversal_of uuid references erp_inventory_movements(id)
);

create table if not exists erp_stock_reservations (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references erp_lots(id),
  reservation_reference text not null,
  quantity numeric(14,3) not null check (quantity > 0),
  status text not null default 'reserved',
  reserved_at timestamptz not null default now(),
  released_at timestamptz,
  notes text
);

create index if not exists idx_erp_lots_item on erp_lots(item_id);
create index if not exists idx_erp_lots_warehouse on erp_lots(warehouse_id);
create index if not exists idx_erp_movements_lot on erp_inventory_movements(lot_id);
create index if not exists idx_erp_movements_date on erp_inventory_movements(movement_date);
create index if not exists idx_erp_reservations_lot on erp_stock_reservations(lot_id);
