alter table public.rental_listings
  add column if not exists image_url text not null default '';
