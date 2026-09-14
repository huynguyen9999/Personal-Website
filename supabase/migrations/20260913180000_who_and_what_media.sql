alter table public.media_assets
drop constraint if exists media_assets_page_check;

alter table public.media_assets
drop constraint if exists media_assets_slot_check;

alter table public.media_assets
add constraint media_assets_page_check
check (page is null or page in ('home', 'about', 'what-i-do', 'who-i-am', 'reading', 'now', 'contact'));

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
    'being-setup',
    'shelf',
    'now-present',
    'contact'
  )
);
