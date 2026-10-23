create table if not exists public.products (
  slug text primary key,
  title text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  status text,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  tags text[] not null default '{}',
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_product_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_product_updated_at();

alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = (select auth.uid())
      and raw_app_meta_data ->> 'role' = 'admin'
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

drop policy if exists "Signed-in users can view active products" on public.products;
drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products"
on public.products
for select
to anon, authenticated
using (is_active);

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
on public.products
for select
to authenticated
using ((select public.is_current_user_admin()));

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using ((select public.is_current_user_admin()))
with check ((select public.is_current_user_admin()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (select public.is_current_user_admin())
);

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_current_user_admin())
)
with check (
  bucket_id = 'product-images'
  and (select public.is_current_user_admin())
);

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_current_user_admin())
);
