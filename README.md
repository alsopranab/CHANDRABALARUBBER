# Chandrabala Rubber Industries — Trading Portal

Responsive corporate website and private B2B portal starter built with Next.js, TypeScript and Supabase.

## Local setup
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor.
5. Run `npm run dev`.

Without Supabase keys the public pages render, but authentication and member operations remain inactive. Do not commit API secrets.

## Initial admin
After registering the intended owner account, use its Supabase Auth UUID in SQL Editor:

```sql
update public.profiles set role='admin', status='approved' where id='YOUR_AUTH_USER_UUID';
```

Admin roles must never be self-assigned through the public signup flow. Passwords are managed by Supabase Auth; administrators may initiate resets but cannot view passwords.

## Images
The starter uses remote Unsplash imagery as temporary visuals. Replace with owned/licensed optimized WebP files in `public/images` or use Supabase Storage for private member uploads. Do not use public Google Drive links for private documents.

## Deployment
Import the repo into Vercel, configure `.env.example` variables, deploy, set the portal domain, then update Supabase Auth Site URL and redirect allowlist. WhatsApp Cloud API and production document delivery require separate credentials and setup.