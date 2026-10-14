-- Tracks public submitter for rate limiting (optional column).
alter table public.rental_listings
  add column if not exists submitter_ip_hash text;

create index if not exists rental_listings_submitter_ip_created_idx
  on public.rental_listings (submitter_ip_hash, created_at desc)
  where submitter_ip_hash is not null;
