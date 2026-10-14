-- Address for listings; neighborhood optional.
alter table public.rental_listings
  add column if not exists address text not null default '';

alter table public.rental_listings
  alter column neighborhood drop not null;

alter table public.rental_listings
  alter column neighborhood set default '';
