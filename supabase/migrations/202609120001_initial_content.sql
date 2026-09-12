create type public.content_status as enum ('draft', 'published');
create type public.content_kind as enum ('page', 'project', 'writing', 'now', 'life', 'social');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind public.content_kind not null,
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  draft_title text,
  draft_summary text,
  draft_body jsonb,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

alter table public.content_items enable row level security;
revoke all on table public.content_items from anon, authenticated;
grant select on table public.content_items to anon;
grant select, insert, update, delete on table public.content_items to authenticated;

create index content_items_owner_id_idx on public.content_items (owner_id);
create index content_items_public_idx on public.content_items (status, kind, sort_order);

create policy "Anyone reads published content"
on public.content_items for select
to anon, authenticated
using (status = 'published');

create policy "Owner reads content"
on public.content_items for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Owner creates content"
on public.content_items for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Owner updates content"
on public.content_items for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Owner deletes content"
on public.content_items for delete
to authenticated
using ((select auth.uid()) = owner_id);

comment on table public.content_items is 'Owner-authored website content. RLS keeps drafts owner-only and exposes only published records.';
