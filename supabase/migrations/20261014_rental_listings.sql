-- Run in Supabase SQL editor (or via CLI) before using /rentals.
create table if not exists public.rental_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text not null default '',
  neighborhood text not null default '',
  monthly_rent integer not null check (monthly_rent > 0),
  bedrooms numeric(4,1),
  bathrooms numeric(4,1),
  available_date date,
  description text not null default '' check (char_length(description) <= 500),
  distance_to_shul text not null default '',
  contact_name text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists rental_listings_status_expires_idx
  on public.rental_listings (status, expires_at desc);

create index if not exists rental_listings_created_idx
  on public.rental_listings (created_at desc);
