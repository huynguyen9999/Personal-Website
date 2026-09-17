update public.content_items
set
  title = 'let''s get in touch.',
  summary = '',
  body = jsonb_build_object('eyebrow', 'CONTACT', 'copy', ''),
  updated_at = now()
where kind = 'page' and slug = 'contact-opening';

update public.content_drafts
set
  title = 'let''s get in touch.',
  summary = '',
  body = jsonb_build_object('eyebrow', 'CONTACT', 'copy', ''),
  updated_at = now()
where kind = 'page' and slug = 'contact-opening';
