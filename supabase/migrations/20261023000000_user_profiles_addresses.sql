create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  date_of_birth date,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_blank check (char_length(btrim(full_name)) > 0)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipient_name text not null,
  phone_number text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  label text not null default 'Home' check (label in ('Home', 'Work')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_created_idx
  on public.addresses (user_id, created_at desc);

create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses (user_id)
  where is_default;

create or replace function public.set_gifterra_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_gifterra_updated_at();

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_gifterra_updated_at();

create or replace function public.set_gifterra_default_address()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_default then
    update public.addresses
    set is_default = false
    where user_id = new.user_id
      and id <> new.id
      and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists addresses_set_default on public.addresses;
create trigger addresses_set_default
before insert or update of is_default on public.addresses
for each row execute function public.set_gifterra_default_address();

create or replace function public.create_gifterra_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(new.email, ''),
      'Gifterra customer'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_gifterra_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_gifterra_profile on auth.users;
create trigger on_auth_user_created_gifterra_profile
after insert on auth.users
for each row execute function public.create_gifterra_profile();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can manage their own addresses" on public.addresses;
create policy "Users can manage their own addresses"
on public.addresses
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'gifterra-avatars',
  'gifterra-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own profile images" on storage.objects;
create policy "Users can view their own profile images"
on storage.objects
for select to authenticated
using (
  bucket_id = 'gifterra-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can upload their own profile images" on storage.objects;
create policy "Users can upload their own profile images"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'gifterra-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update their own profile images" on storage.objects;
create policy "Users can update their own profile images"
on storage.objects
for update to authenticated
using (
  bucket_id = 'gifterra-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'gifterra-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete their own profile images" on storage.objects;
create policy "Users can delete their own profile images"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'gifterra-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
