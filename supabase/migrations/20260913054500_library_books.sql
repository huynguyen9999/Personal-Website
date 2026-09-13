create type public.book_shelf as enum (
  'currently_reading',
  'read',
  'reading_next'
);

create table public.library_books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  author text not null default '' check (char_length(author) <= 180),
  isbn13 text check (isbn13 is null or isbn13 ~ '^[0-9]{13}$'),
  goodreads_url text not null check (
    goodreads_url ~ '^https://(www\.)?goodreads\.com/'
    and char_length(goodreads_url) <= 500
  ),
  shelf public.book_shelf not null,
  cover_url text,
  cover_source text not null check (cover_source in ('open_library', 'google_books')),
  cover_source_url text not null,
  cover_alt text not null default '' check (char_length(cover_alt) <= 240),
  metadata_provider text not null check (metadata_provider in ('open_library', 'google_books')),
  provider_id text not null,
  description text not null default '' check (char_length(description) <= 5000),
  published_date text not null default '' check (char_length(published_date) <= 80),
  average_rating numeric(3, 2) check (average_rating is null or average_rating between 0 and 5),
  ratings_count integer check (ratings_count is null or ratings_count >= 0),
  note text not null default '' check (char_length(note) <= 500),
  status public.content_status not null default 'draft',
  sort_order integer not null default 0 check (sort_order between -100000 and 100000),
  published_at timestamptz,
  metadata_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index library_books_public_idx
on public.library_books (status, shelf, sort_order, updated_at desc);

create index library_books_owner_idx
on public.library_books (owner_id, updated_at desc);

create unique index library_books_owner_isbn_idx
on public.library_books (owner_id, isbn13)
where isbn13 is not null;

alter table public.library_books enable row level security;

revoke all on table public.library_books from anon, authenticated;
grant select on table public.library_books to anon;
grant select, insert, update, delete on table public.library_books to authenticated;

create policy "Public reads published books"
on public.library_books for select
to anon
using (status = 'published');

create policy "Authenticated reads allowed books"
on public.library_books for select
to authenticated
using (
  status = 'published'
  or (
    (select auth.uid()) = owner_id
    and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
  )
);

create policy "Owner creates books"
on public.library_books for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner updates books"
on public.library_books for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
)
with check (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

create policy "Owner deletes books"
on public.library_books for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and (select lower(coalesce(auth.jwt() ->> 'email', ''))) = 'dominichuyn@gmail.com'
);

update public.media_assets
set page = 'reading', slot = 'shelf'
where page = 'writing' and slot = 'archive';

alter table public.media_assets
drop constraint if exists media_assets_page_check;

alter table public.media_assets
drop constraint if exists media_assets_slot_check;

alter table public.media_assets
add constraint media_assets_page_check
check (page is null or page in ('home', 'about', 'reading', 'now', 'contact'));

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
    'shelf',
    'now-present',
    'contact'
  )
);

comment on table public.library_books is
  'Owner-curated reading shelf. Anonymous visitors can read only published rows.';

insert into public.library_books (
  owner_id,
  title,
  author,
  isbn13,
  goodreads_url,
  shelf,
  cover_url,
  cover_source,
  cover_source_url,
  cover_alt,
  metadata_provider,
  provider_id,
  description,
  published_date,
  note,
  status,
  sort_order,
  published_at
)
select
  users.id,
  'Atomic Habits',
  'James Clear',
  '9781847941831',
  'https://www.goodreads.com/book/show/40121378',
  'currently_reading',
  'https://covers.openlibrary.org/b/id/15247577-L.jpg',
  'open_library',
  'https://openlibrary.org/books/OL57360656M/Atomic_Habits',
  'Cover of Atomic Habits by James Clear',
  'open_library',
  'OL57360656M',
  'No matter your goals, Atomic Habits offers a framework for improving every day through small, repeatable changes.',
  'October 18, 2018',
  '',
  'published',
  0,
  now()
from auth.users as users
where lower(users.email) = 'dominichuyn@gmail.com'
  and not exists (
    select 1 from public.library_books where isbn13 = '9781847941831'
  );
