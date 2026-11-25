# Chandrabala Rubber ERP

A data-first, modular ERP for Chandrabala Rubber Industries. This ERP is isolated in the `erp/` directory and does not modify the existing website.

## Design principles
- Inventory ledger is the source of truth; balances are derived from movements.
- Rubber-industry taxonomy: Assortment Group > Family > Item > Lot.
- Track physical, reserved, available, and in-transit quantities.
- Preserve purchase-to-lot-to-sale traceability.
- Reporting and operational analytics are first-class capabilities.
- Separate roles and audit trails for consequential transactions.

## Initial modules
1. Procurement & weighment
2. Sorting / quality classification
3. Inventory & lot ledger
4. Sales / allocation / dispatch
5. Supplier & buyer accounts
6. Management analytics

## Planned stack
Next.js App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth), charting layer.

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md), [ROADMAP.md](./docs/ROADMAP.md), and [schema.sql](./database/schema.sql).
