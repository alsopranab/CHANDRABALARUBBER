# Inventory control prototype

This release adds an inventory workspace at /inventory with sample lots, searchable/filterable lot table, physical/reserved/available KPIs, illustrative value, and a local demo lot-add form.

**Important:** UI data is in-memory demo data. No database writes or transactions are implemented. Do not use demo numbers for purchasing, dispatch, or valuation decisions.

## Core balance definitions
- Physical stock: sum of posted inventory movements (not implemented in UI yet)
- Reserved stock: active reservation quantities
- Available stock: physical stock less active reservations
- Stock corrections should be ledger adjustments/reversals, not edits to historic movements

## Next engineering steps
1. Deploy SQL schema only after review and test.
2. Supabase Auth, organization roles, RLS policies.
3. Transaction-safe receipt and movement functions.
4. Reservations with concurrency protection.
5. Sorting transformation: parent lot, child lots, input/output and wastage yield.
6. Traceability, costing, stock ageing and analytical reports.
