-- Private staging prevents a direct browser upload from becoming public before
-- the owner has assigned it to a real page location.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media-staging',
  'site-media-staging',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owner lists staged site media" on storage.objects;
drop policy if exists "Owner uploads staged site media" on storage.objects;
drop policy if exists "Owner deletes staged site media" on storage.objects;

create policy "Owner lists staged site media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'site-media-staging'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner uploads staged site media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-media-staging'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes staged site media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-media-staging'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

alter table public.media_assets
drop constraint if exists media_assets_slot_check;

alter table public.media_assets
add constraint media_assets_slot_check
check (
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
    'doing-engineer',
    'doing-creator',
    'doing-student',
    'being-drive',
    'being-cubes',
    'being-setup',
    'being-adventures',
    'being-tennis',
    'shelf',
    'now-present',
    'contact'
  )
);

-- New rows must be fully placed and must use a slot that belongs to its page.
-- NOT VALID preserves any legacy records so they can be intentionally reviewed
-- and removed through the admin library rather than silently discarded.
alter table public.media_assets
add constraint media_assets_complete_valid_placement
check (
  (page = 'home' and slot in ('opening', 'manifesto', 'thread-origin', 'thread-study', 'thread-practice', 'thread-public', 'route'))
  or (page = 'about' and slot in ('header', 'moment-hcmc', 'moment-us', 'moment-ucsb'))
  or (page = 'what-i-do' and slot in ('doing-engineer', 'doing-creator', 'doing-student'))
  or (page = 'who-i-am' and slot in ('being-drive', 'being-cubes', 'being-setup', 'being-adventures', 'being-tennis'))
  or (page = 'reading' and slot = 'shelf')
  or (page = 'now' and slot = 'now-present')
  or (page = 'contact' and slot = 'contact')
) not valid;
