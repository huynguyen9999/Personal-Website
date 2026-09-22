# Production security activation

The code now fails closed: `/admin` only accepts the Supabase account whose immutable UUID is set in `ADMIN_USER_ID`. Complete these dashboard steps before deploying this change.

1. In **Supabase → Authentication → Users**, copy the UUID for the one existing administrator account.
2. In **Vercel → personal-website → Settings → Environment Variables**, add `ADMIN_USER_ID` with that UUID for Production, Preview, and Development. Remove the obsolete `ADMIN_EMAIL` variable.
3. In **Supabase → Authentication → Providers → Email**, turn off **Allow new users to sign up**. Existing users can still sign in.
4. In **Supabase → SQL Editor**, run the SQL in `supabase/migrations/20260922000000_harden_admin_and_media.sql`.
5. In **Vercel → Firewall → Rules**, review the staged `Observe public API rate` rule. It is log-only and safe to publish. After a day of traffic, edit it to return `429` at an appropriate limit (start at 120 requests/minute/IP for `/api/*`).

After deployment, sign in at `/admin`, upload one test photo, verify it appears on its selected page, and delete the test photo. New uploads are private until the server validates and publishes their placement.
