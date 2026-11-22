# Deployment checklist

## Vercel
- Import `alsopranab/CHANDRABALARUBBER` as a Next.js project.
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
- Deploy to preview first and run the production build.
- Assign `portal.chandrabalarubber.com` in Vercel and configure DNS as instructed by Vercel.

## Supabase
- Run `supabase/migrations/001_initial_schema.sql` in SQL Editor.
- Confirm RLS is enabled on every application table.
- Set Auth Site URL and redirect allowlist to the portal domain.
- Configure email confirmation and a production SMTP provider.
- Register the intended owner account, then promote its UUID using the one-time SQL in README.
- Test pending signup, approval, suspended login, user isolation and private file policies using two test accounts.

## Images and documents
- Replace temporary Unsplash links with company-owned or properly licensed imagery, committed as optimized WebP files in `public/images`.
- Keep supplier uploads, GST proofs, invoices and other private files in the private Supabase Storage bucket, in user-scoped folders. Do not use publicly shared Google Drive files for confidential records.

## Not connected by this starter
- WhatsApp Cloud API and document messaging.
- Production invoice creation, invoice numbering and GST validation.
- Payment gateway / bank reconciliation.
- Contact-form delivery and notification emails.
- Complete inventory and transaction UI, atomic stock reservation/deduction and audited finalization.

These require external provider credentials and additional implementation/testing before the portal is used for live trade.