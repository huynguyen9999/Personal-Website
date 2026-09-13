drop policy if exists "Anyone reads published content" on public.content_items;
drop policy if exists "Owner reads content" on public.content_items;
drop policy if exists "Public reads published content" on public.content_items;
drop policy if exists "Authenticated reads allowed content" on public.content_items;
drop policy if exists "Owner creates content" on public.content_items;
drop policy if exists "Owner updates content" on public.content_items;
drop policy if exists "Owner deletes content" on public.content_items;

create policy "Public reads published content"
on public.content_items for select
to anon
using (status = 'published');

create policy "Authenticated reads allowed content"
on public.content_items for select
to authenticated
using (
  status = 'published'
  or (
    (select auth.uid()) = owner_id
    and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
  )
);

create policy "Owner creates content"
on public.content_items for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner updates content"
on public.content_items for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
)
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes content"
on public.content_items for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

drop policy if exists "Owner reads drafts" on public.content_drafts;
drop policy if exists "Owner creates drafts" on public.content_drafts;
drop policy if exists "Owner updates drafts" on public.content_drafts;
drop policy if exists "Owner deletes drafts" on public.content_drafts;

create policy "Owner reads drafts"
on public.content_drafts for select
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner creates drafts"
on public.content_drafts for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner updates drafts"
on public.content_drafts for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
)
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes drafts"
on public.content_drafts for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

drop policy if exists "Owner lists site media" on storage.objects;
drop policy if exists "Owner uploads site media" on storage.objects;
drop policy if exists "Owner updates site media" on storage.objects;
drop policy if exists "Owner deletes site media" on storage.objects;

create policy "Owner lists site media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'site-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner uploads site media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner updates site media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'site-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
)
with check (
  bucket_id = 'site-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes site media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'site-media'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create index if not exists content_drafts_owner_id_idx on public.content_drafts (owner_id);

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
