create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  page text,
  slot text,
  alt text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_page_check check (page is null or page in ('home', 'about', 'writing', 'now', 'contact')),
  constraint media_assets_slot_check check (
    slot is null or slot in (
      'opening',
      'manifesto',
      'thread-origin',
      'thread-study',
      'thread-practice',
      'thread-public',
      'route',
      'header',
      'moment-hcmc',
      'moment-us',
      'moment-ucsb',
      'archive',
      'now-present',
      'contact'
    )
  )
);

create index media_assets_page_slot_idx on public.media_assets (page, slot, sort_order);

alter table public.media_assets enable row level security;
revoke all on table public.media_assets from anon, authenticated;
grant select on table public.media_assets to anon, authenticated;
grant insert, update, delete on table public.media_assets to authenticated;

create policy "Public reads placed photos"
on public.media_assets for select
to anon
using (page is not null and slot is not null);

create policy "Authenticated reads allowed media"
on public.media_assets for select
to authenticated
using (
  (page is not null and slot is not null)
  or (
    (select auth.uid()) = owner_id
    and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
  )
);

create policy "Owner creates media"
on public.media_assets for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner updates media"
on public.media_assets for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
)
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes media"
on public.media_assets for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

comment on table public.media_assets is 'Owner-uploaded photos and the page slot they appear in. Unplaced rows stay owner-only.';
