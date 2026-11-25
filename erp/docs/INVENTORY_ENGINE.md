# Inventory control prototype

The /inventory workspace includes searchable lot records, physical/reserved/available KPIs, illustrative valuation and an in-memory demo lot form.

**Demo-only:** UI records are sample data and not database writes. Do not use them for purchasing, dispatch or valuation.

## Balance principles
- Physical stock derives from posted inventory movements.
- Reserved stock derives from active reservations.
- Available stock = physical less reservations.
- Corrections use adjustment/reversal movements; avoid rewriting history.

## Next
1. Test and deploy schema to a non-production Supabase project.
2. Supabase Auth, roles and RLS policies.
3. Transaction-safe purchase receipt posting and ledger movements.
4. Reservation logic with concurrency protection.
5. Sorting transformation traceability, yield and loss reconciliation.
6. Costing, stock ageing and reports.
