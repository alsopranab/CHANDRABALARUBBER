-- ERP security baseline. Apply only in staging first.
create table if not exists erp_user_roles(user_id uuid primary key references auth.users(id) on delete cascade,role text not null check(role in('admin','manager','staff','viewer')),created_at timestamptz not null default now());
create or replace function erp_has_role(allowed text[]) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from erp_user_roles where user_id=auth.uid() and role=any(allowed)) $$;
alter table erp_user_roles enable row level security;
alter table erp_module_settings enable row level security;
alter table erp_assortment_groups enable row level security;
alter table erp_families enable row level security;
alter table erp_items enable row level security;
alter table erp_suppliers enable row level security;
alter table erp_buyers enable row level security;
alter table erp_warehouses enable row level security;
alter table erp_purchase_receipts enable row level security;
alter table erp_lots enable row level security;
alter table erp_inventory_movements enable row level security;
alter table erp_stock_reservations enable row level security;
alter table erp_sorting_runs enable row level security;
alter table erp_sorting_outputs enable row level security;
alter table erp_sales_orders enable row level security;
alter table erp_sales_order_lines enable row level security;
create policy erp_role_self_read on erp_user_roles for select to authenticated using(user_id=auth.uid());
create policy erp_role_admin_all on erp_user_roles for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
-- Admin/manager can read ERP data; administrators alone mutate masters/settings.
create policy erp_settings_admin on erp_module_settings for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_master_read on erp_assortment_groups for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_master_admin on erp_assortment_groups for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_family_read on erp_families for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_family_admin on erp_families for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_item_read on erp_items for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_item_admin on erp_items for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_supplier_read on erp_suppliers for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_supplier_admin on erp_suppliers for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_buyer_read on erp_buyers for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_buyer_admin on erp_buyers for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
create policy erp_warehouse_read on erp_warehouses for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_warehouse_admin on erp_warehouses for all to authenticated using(erp_has_role(array['admin'])) with check(erp_has_role(array['admin']));
-- Transactional tables: read policies, write access reserved for RPCs/server-side functions after review.
create policy erp_receipts_read on erp_purchase_receipts for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_lots_read on erp_lots for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_movements_read on erp_inventory_movements for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_reservations_read on erp_stock_reservations for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_sorting_read on erp_sorting_runs for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_sort_outputs_read on erp_sorting_outputs for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_sales_read on erp_sales_orders for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
create policy erp_sales_lines_read on erp_sales_order_lines for select to authenticated using(erp_has_role(array['admin','manager','staff','viewer']));
-- Restrict function execution; grant selectively after confirming role policies and ownership.
revoke execute on function erp_post_receipt(uuid) from public;
revoke execute on function erp_post_sorting_run(uuid) from public;
revoke execute on function erp_reserve_stock(uuid,text,numeric,text) from public;
revoke execute on function erp_release_reservation(uuid) from public;
