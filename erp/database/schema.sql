-- Chandrabala ERP schema. Review/test in non-production Supabase before execution.
create table if not exists erp_module_settings(module_id text primary key,enabled boolean not null default true,updated_at timestamptz not null default now(),updated_by uuid);
create table if not exists erp_assortment_groups(id uuid primary key default gen_random_uuid(),code text unique not null,name text not null,active boolean not null default true,created_at timestamptz not null default now());
create table if not exists erp_families(id uuid primary key default gen_random_uuid(),assortment_group_id uuid not null references erp_assortment_groups(id),code text not null,name text not null,active boolean not null default true,unique(assortment_group_id,code));
create table if not exists erp_items(id uuid primary key default gen_random_uuid(),family_id uuid not null references erp_families(id),code text unique not null,name text not null,base_unit text not null default 'kg',active boolean not null default true,created_at timestamptz not null default now());
create table if not exists erp_suppliers(id uuid primary key default gen_random_uuid(),supplier_code text unique,name text not null,phone text,address text,notes text,active boolean not null default true,created_at timestamptz not null default now());
create table if not exists erp_buyers(id uuid primary key default gen_random_uuid(),buyer_code text unique,name text not null,phone text,address text,notes text,active boolean not null default true,created_at timestamptz not null default now());
create table if not exists erp_warehouses(id uuid primary key default gen_random_uuid(),code text unique not null,name text not null,address text,active boolean not null default true);
create table if not exists erp_purchase_receipts(id uuid primary key default gen_random_uuid(),receipt_number text unique not null,supplier_id uuid references erp_suppliers(id),receipt_date date not null default current_date,vehicle_number text,gross_weight numeric(14,3),tare_weight numeric(14,3),net_weight numeric(14,3),purchase_rate_per_kg numeric(14,4),notes text,status text not null default 'draft' check(status in('draft','posted','void')),created_at timestamptz not null default now(),created_by uuid);
create table if not exists erp_lots(id uuid primary key default gen_random_uuid(),lot_code text unique not null,item_id uuid not null references erp_items(id),warehouse_id uuid references erp_warehouses(id),source_receipt_id uuid references erp_purchase_receipts(id),parent_lot_id uuid references erp_lots(id),lot_date date not null default current_date,opening_quantity numeric(14,3) not null default 0 check(opening_quantity>=0),estimated_cost_per_kg numeric(14,4),quality_notes text,status text not null default 'active',created_at timestamptz not null default now());
create table if not exists erp_inventory_movements(id uuid primary key default gen_random_uuid(),lot_id uuid not null references erp_lots(id),movement_type text not null check(movement_type in('receipt','transfer_in','transfer_out','sorting_input','sorting_output','dispatch','adjustment','reversal')),quantity numeric(14,3) not null check(quantity>0),direction smallint not null check(direction in(-1,1)),unit text not null default 'kg',reference_type text,reference_id uuid,movement_date timestamptz not null default now(),notes text,created_by uuid,created_at timestamptz not null default now(),reversal_of uuid references erp_inventory_movements(id));
create table if not exists erp_stock_reservations(id uuid primary key default gen_random_uuid(),lot_id uuid not null references erp_lots(id),reservation_reference text not null,quantity numeric(14,3) not null check(quantity>0),status text not null default 'reserved' check(status in('reserved','released','fulfilled','cancelled')),reserved_at timestamptz not null default now(),released_at timestamptz,notes text);
create table if not exists erp_sorting_runs(id uuid primary key default gen_random_uuid(),run_code text unique not null,input_lot_id uuid not null references erp_lots(id),input_quantity numeric(14,3) not null check(input_quantity>0),run_date date not null default current_date,notes text,status text not null default 'draft',created_at timestamptz not null default now());
create table if not exists erp_sorting_outputs(id uuid primary key default gen_random_uuid(),run_id uuid not null references erp_sorting_runs(id),output_lot_id uuid not null references erp_lots(id),output_quantity numeric(14,3) not null check(output_quantity>=0),quality_grade text,notes text);
create table if not exists erp_sales_orders(id uuid primary key default gen_random_uuid(),order_number text unique not null,buyer_id uuid references erp_buyers(id),order_date date not null default current_date,status text not null default 'draft',notes text,created_at timestamptz not null default now());
create table if not exists erp_sales_order_lines(id uuid primary key default gen_random_uuid(),order_id uuid not null references erp_sales_orders(id),item_id uuid not null references erp_items(id),quantity numeric(14,3) not null check(quantity>0),rate numeric(14,4),status text not null default 'open');
create index if not exists idx_erp_lots_item on erp_lots(item_id);create index if not exists idx_erp_lots_warehouse on erp_lots(warehouse_id);create index if not exists idx_erp_movements_lot_date on erp_inventory_movements(lot_id,movement_date);create index if not exists idx_erp_reservations_lot_status on erp_stock_reservations(lot_id,status);create index if not exists idx_erp_receipts_date on erp_purchase_receipts(receipt_date);create index if not exists idx_erp_sorting_input on erp_sorting_runs(input_lot_id);
-- Stock balance is movement sum(quantity*direction). Reservations are independent. Posting functions and RLS are required before production.

alter table erp_purchase_receipts add column if not exists item_id uuid references erp_items(id);
alter table erp_purchase_receipts add column if not exists warehouse_id uuid references erp_warehouses(id);
alter table erp_sorting_runs add column if not exists warehouse_id uuid references erp_warehouses(id);
alter table erp_sorting_outputs add column if not exists item_id uuid references erp_items(id);
alter table erp_sorting_outputs add column if not exists warehouse_id uuid references erp_warehouses(id);
create or replace function erp_lot_physical_balance(p_lot uuid) returns numeric language sql stable as $$ select coalesce(sum(quantity*direction),0) from erp_inventory_movements where lot_id=p_lot $$;
create or replace function erp_lot_reserved_balance(p_lot uuid) returns numeric language sql stable as $$ select coalesce(sum(quantity),0) from erp_stock_reservations where lot_id=p_lot and status='reserved' $$;
create or replace function erp_post_receipt(p_receipt uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare r erp_purchase_receipts; lot uuid;
begin
 select * into r from erp_purchase_receipts where id=p_receipt for update;
 if not found then raise exception 'Receipt not found'; end if;
 if r.status<>'draft' then raise exception 'Only draft receipts can be posted'; end if;
 if r.item_id is null or r.warehouse_id is null or r.net_weight is null or r.net_weight<=0 then raise exception 'Receipt requires item, warehouse and positive net weight'; end if;
 insert into erp_lots(lot_code,item_id,warehouse_id,source_receipt_id,lot_date,opening_quantity,estimated_cost_per_kg) values(r.receipt_number,r.item_id,r.warehouse_id,r.id,r.receipt_date,r.net_weight,r.purchase_rate_per_kg) returning id into lot;
 insert into erp_inventory_movements(lot_id,movement_type,quantity,direction,reference_type,reference_id,notes) values(lot,'receipt',r.net_weight,1,'purchase_receipt',r.id,'Receipt posting');
 update erp_purchase_receipts set status='posted' where id=r.id; return lot;
end $$;
create or replace function erp_post_sorting_run(p_run uuid) returns void language plpgsql security definer set search_path=public as $$
declare s erp_sorting_runs; o erp_sorting_outputs; bal numeric; total numeric:=0; child uuid;
begin
 select * into s from erp_sorting_runs where id=p_run for update;
 if not found or s.status<>'draft' then raise exception 'Sorting run not found or not draft'; end if;
 select erp_lot_physical_balance(s.input_lot_id) into bal;
 if bal<s.input_quantity then raise exception 'Insufficient physical stock'; end if;
 if erp_lot_reserved_balance(s.input_lot_id)>bal-s.input_quantity then raise exception 'Input stock is reserved'; end if;
 select coalesce(sum(output_quantity),0) into total from erp_sorting_outputs where run_id=s.id;
 if total>s.input_quantity then raise exception 'Outputs exceed input'; end if;
 insert into erp_inventory_movements(lot_id,movement_type,quantity,direction,reference_type,reference_id,notes) values(s.input_lot_id,'sorting_input',s.input_quantity,-1,'sorting_run',s.id,'Sorting consumption');
 for o in select * from erp_sorting_outputs where run_id=s.id and output_quantity>0 loop
  if o.item_id is null or o.warehouse_id is null then raise exception 'Every positive output requires item and warehouse'; end if;
  insert into erp_lots(lot_code,item_id,warehouse_id,parent_lot_id,lot_date,opening_quantity,quality_notes) values(s.run_code||'-'||substr(o.id::text,1,8),o.item_id,o.warehouse_id,s.input_lot_id,s.run_date,o.output_quantity,coalesce(o.quality_grade,'')||coalesce(': '||o.notes,'')) returning id into child;
  insert into erp_inventory_movements(lot_id,movement_type,quantity,direction,reference_type,reference_id,notes) values(child,'sorting_output',o.output_quantity,1,'sorting_run',s.id,'Sorting output');
  update erp_sorting_outputs set output_lot_id=child where id=o.id;
 end loop;
 update erp_sorting_runs set status='posted' where id=s.id;
end $$;
create or replace function erp_reserve_stock(p_lot uuid,p_reference text,p_qty numeric,p_notes text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare phys numeric; res numeric; rid uuid;
begin
 if p_qty<=0 then raise exception 'Quantity must be positive'; end if;
 perform 1 from erp_lots where id=p_lot for update; if not found then raise exception 'Lot not found'; end if;
 phys:=erp_lot_physical_balance(p_lot); res:=erp_lot_reserved_balance(p_lot);
 if phys-res<p_qty then raise exception 'Insufficient available stock'; end if;
 insert into erp_stock_reservations(lot_id,reservation_reference,quantity,notes) values(p_lot,p_reference,p_qty,p_notes) returning id into rid; return rid;
end $$;
create or replace function erp_release_reservation(p_reservation uuid) returns void language plpgsql security definer set search_path=public as $$
declare r erp_stock_reservations;
begin select * into r from erp_stock_reservations where id=p_reservation for update;
if not found then raise exception 'Reservation not found'; end if;
if r.status<>'reserved' then raise exception 'Reservation is not active'; end if;
update erp_stock_reservations set status='released',released_at=now() where id=r.id; end $$;
-- Configure RLS, revoke public execution and role-specific grants before production.

-- Sorting output rows are staged before child lot creation; allow output_lot_id to be null until posting.
alter table erp_sorting_outputs alter column output_lot_id drop not null;
