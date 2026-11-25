# ERP Transaction Workflows

## Procurement
The procurement workspace reads active suppliers, items and warehouses from Supabase. Draft receipts are stored in `erp_purchase_receipts`. Posting invokes `erp_post_receipt(p_receipt)`, which creates a lot and positive stock movement, then marks the receipt posted.

## Inventory
The inventory workspace derives physical balances by summing ledger movements (quantity multiplied by direction), and active reservations separately. Reserve/release operations invoke the reservation functions.

## Sorting
Sorting creates a draft run and staged output rows. Posting invokes `erp_post_sorting_run(p_run)`, which consumes input stock and creates child lots/output movements.

## Before production
- Execute schema and security scripts only in a controlled Supabase staging environment.
- Test all RPCs, RLS policies, auth sessions, and role behavior.
- Review SECURITY DEFINER functions, grants, search_path, and authorization checks.
- Validate rollback behavior and stock reconciliation.
- Confirm item/warehouse master records are complete.
- Test invalid, over-reserved, over-output, duplicate and concurrent posting scenarios.
- Configure ERP environment variables and authentication.
