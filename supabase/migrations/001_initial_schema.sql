create extension if not exists pgcrypto;
create type public.member_role as enum ('buyer','seller','admin');
create type public.member_status as enum ('pending','under_review','approved','rejected','suspended','disabled');
create type public.record_status as enum ('draft','submitted','under_review','approved','rejected','cancelled','completed');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', company_name text not null default '',
 role public.member_role not null default 'buyer', status public.member_status not null default 'pending',
 email text, phone text, gstin text, business_address text, state text, pin_code text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.inventory (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id),
 product_name text not null, grade text, lot_type text, quantity numeric(14,3) not null check(quantity>0),
 unit text not null default 'kg', asking_rate numeric(14,2) check(asking_rate is null or asking_rate>=0),
 location text, description text, photo_paths text[] not null default '{}',
 status public.record_status not null default 'submitted', verified_by uuid references public.profiles(id),
 verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.purchase_requests (
 id uuid primary key default gen_random_uuid(), buyer_id uuid not null references public.profiles(id),
 product_name text not null, grade text, lot_type text, quantity numeric(14,3) not null check(quantity>0),
 unit text not null default 'kg', delivery_location text, notes text,
 status public.record_status not null default 'submitted', created_at timestamptz not null default now()
);
create table public.transactions (
 id uuid primary key default gen_random_uuid(), transaction_number text unique,
 buyer_id uuid not null references public.profiles(id), seller_id uuid not null references public.profiles(id),
 status public.record_status not null default 'submitted', subtotal numeric(14,2) not null default 0,
 tax_amount numeric(14,2) not null default 0, total_amount numeric(14,2) not null default 0,
 delivery_location text, approved_by uuid references public.profiles(id), approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(buyer_id<>seller_id)
);
create table public.transaction_items (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.transactions(id) on delete cascade,
 inventory_id uuid references public.inventory(id), product_name text not null, grade text,
 quantity numeric(14,3) not null check(quantity>0), unit text not null default 'kg',
 rate numeric(14,2) not null check(rate>=0), line_total numeric(14,2) generated always as(round(quantity*rate,2)) stored
);
create table public.inventory_movements (
 id uuid primary key default gen_random_uuid(), inventory_id uuid not null references public.inventory(id),
 transaction_id uuid references public.transactions(id), movement_type text not null check(movement_type in('received','reserved','sold','adjusted','returned','released')),
 quantity numeric(14,3) not null check(quantity>0), notes text, created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.invoices (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null unique references public.transactions(id),
 invoice_number text not null unique, document_path text, issued_at timestamptz not null default now(),
 issued_by uuid not null references public.profiles(id), status text not null default 'issued' check(status in('issued','cancelled','superseded')),
 created_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.transactions(id),
 amount numeric(14,2) not null check(amount>0), method text, reference text, payment_date date,
 status text not null default 'recorded' check(status in('recorded','verified','rejected','reversed')),
 recorded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.audit_logs (
 id bigint generated always as identity primary key, actor_id uuid references public.profiles(id),
 action text not null, entity_type text not null, entity_id text, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, message text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create index inventory_seller_idx on public.inventory(seller_id);
create index inventory_status_idx on public.inventory(status);
create index requests_buyer_idx on public.purchase_requests(buyer_id);
create index transactions_buyer_idx on public.transactions(buyer_id);
create index transactions_seller_idx on public.transactions(seller_id);
create index notifications_user_idx on public.notifications(user_id,created_at desc);

create or replace function public.is_approved_admin() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and status='approved') $$;
create or replace function public.is_approved_member() returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and status='approved') $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public
as $$ begin
 insert into public.profiles(id,full_name,company_name,role,status,email,phone,gstin)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'company_name',''),
 case when new.raw_user_meta_data->>'role'='seller' then 'seller'::public.member_role else 'buyer'::public.member_role end,
 'pending',new.email,new.raw_user_meta_data->>'phone',new.raw_user_meta_data->>'gstin') on conflict(id) do nothing;
 return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.admin_review_member(target_user_id uuid,new_status public.member_status)
returns void language plpgsql security definer set search_path=public
as $$ declare actor uuid:=auth.uid(); begin
 if not public.is_approved_admin() then raise exception 'Administrator approval required'; end if;
 if new_status not in('approved','rejected','suspended','disabled','pending','under_review') then raise exception 'Invalid status'; end if;
 update public.profiles set status=new_status,updated_at=now() where id=target_user_id and role<>'admin';
 if not found then raise exception 'Member not found or cannot be changed'; end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,details)
 values(actor,'member_status_changed','profile',target_user_id::text,jsonb_build_object('status',new_status));
end $$;
revoke all on function public.admin_review_member(uuid,public.member_status) from public;
grant execute on function public.admin_review_member(uuid,public.member_status) to authenticated;

alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

create policy "Profile own or admin select" on public.profiles for select to authenticated using(id=auth.uid() or public.is_approved_admin());
create policy "Profile self update" on public.profiles for update to authenticated using(id=auth.uid() and status in('pending','approved')) with check(id=auth.uid() and role<>'admin' and status in('pending','approved'));
create policy "Admin profile update" on public.profiles for update to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());

create policy "Seller insert own stock" on public.inventory for insert to authenticated with check(seller_id=auth.uid() and public.is_approved_member() and (select role from public.profiles where id=auth.uid())='seller' and status='submitted');
create policy "Seller own stock or admin select" on public.inventory for select to authenticated using((seller_id=auth.uid() and public.is_approved_member()) or public.is_approved_admin());
create policy "Seller update own unapproved stock" on public.inventory for update to authenticated using(seller_id=auth.uid() and public.is_approved_member() and status in('draft','submitted','rejected')) with check(seller_id=auth.uid() and status in('draft','submitted'));
create policy "Admin inventory all" on public.inventory for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());

create policy "Buyer insert own requests" on public.purchase_requests for insert to authenticated with check(buyer_id=auth.uid() and public.is_approved_member() and (select role from public.profiles where id=auth.uid()) in('buyer','admin'));
create policy "Buyer request own or admin select" on public.purchase_requests for select to authenticated using((buyer_id=auth.uid() and public.is_approved_member()) or public.is_approved_admin());
create policy "Admin requests all" on public.purchase_requests for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());

create policy "Transaction party or admin select" on public.transactions for select to authenticated using(public.is_approved_admin() or (public.is_approved_member() and (buyer_id=auth.uid() or seller_id=auth.uid())));
create policy "Admin transactions all" on public.transactions for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());
create policy "Transaction items party select" on public.transaction_items for select to authenticated using(exists(select 1 from public.transactions t where t.id=transaction_id and (t.buyer_id=auth.uid() or t.seller_id=auth.uid()) and public.is_approved_member()) or public.is_approved_admin());
create policy "Admin items all" on public.transaction_items for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());
create policy "Invoice party select" on public.invoices for select to authenticated using(public.is_approved_admin() or exists(select 1 from public.transactions t where t.id=transaction_id and (t.buyer_id=auth.uid() or t.seller_id=auth.uid()) and public.is_approved_member()));
create policy "Admin invoices all" on public.invoices for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());
create policy "Payment party select" on public.payments for select to authenticated using(public.is_approved_admin() or exists(select 1 from public.transactions t where t.id=transaction_id and (t.buyer_id=auth.uid() or t.seller_id=auth.uid()) and public.is_approved_member()));
create policy "Admin payments all" on public.payments for all to authenticated using(public.is_approved_admin()) with check(public.is_approved_admin());

create policy "Admin movement select" on public.inventory_movements for select to authenticated using(public.is_approved_admin());
create policy "Admin movement insert" on public.inventory_movements for insert to authenticated with check(public.is_approved_admin());
create policy "Admin audit select" on public.audit_logs for select to authenticated using(public.is_approved_admin());
create policy "Admin audit insert" on public.audit_logs for insert to authenticated with check(public.is_approved_admin());
create policy "Own notification select" on public.notifications for select to authenticated using(user_id=auth.uid() or public.is_approved_admin());
create policy "Own notification update" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Admin notification insert" on public.notifications for insert to authenticated with check(public.is_approved_admin());

insert into storage.buckets(id,name,public) values('business-documents','business-documents',false) on conflict(id) do nothing;
create policy "Admin documents all" on storage.objects for all to authenticated using(bucket_id='business-documents' and public.is_approved_admin()) with check(bucket_id='business-documents' and public.is_approved_admin());
create policy "Read own document folder" on storage.objects for select to authenticated using(bucket_id='business-documents' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_member());
create policy "Upload own document folder" on storage.objects for insert to authenticated with check(bucket_id='business-documents' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_member());
