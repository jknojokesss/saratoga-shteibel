alter table public.rental_listings
  add column if not exists phase smallint check (phase is null or (phase >= 1 and phase <= 9));
