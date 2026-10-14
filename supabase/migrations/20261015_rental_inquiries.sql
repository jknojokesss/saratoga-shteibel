-- Rental inquiries + listing owner email / leased status.

alter table public.rental_listings
  add column if not exists owner_email text not null default '';

alter table public.rental_listings
  add column if not exists leased_at date;

alter table public.rental_listings
  drop constraint if exists rental_listings_status_check;

alter table public.rental_listings
  add constraint rental_listings_status_check
  check (status in ('active', 'hidden', 'leased'));

-- Backfill owner email from legacy contact field when empty.
update public.rental_listings
set owner_email = contact_email
where owner_email = '' and contact_email <> '';

create table if not exists public.rental_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.rental_listings (id) on delete cascade,
  requester_name text not null,
  requester_phone text not null default '',
  requester_email text not null default '',
  move_in_date date,
  message text not null default '' check (char_length(message) <= 500),
  created_at timestamptz not null default now(),
  email_status text not null check (email_status in ('sent', 'failed')),
  ip_hash text not null default ''
);

create index if not exists rental_inquiries_listing_idx
  on public.rental_inquiries (listing_id, created_at desc);

create index if not exists rental_inquiries_ip_created_idx
  on public.rental_inquiries (ip_hash, created_at desc);
