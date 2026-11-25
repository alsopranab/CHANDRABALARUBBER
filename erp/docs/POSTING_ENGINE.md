# Posting engine

Schema addendum provides transactional receipt posting (draft -> lot + receipt movement), sorting posting (input consumption and child lots with positive output movements), reservation with locked-lot availability validation, reservation release, and ledger balance helpers.

Staging verification:
1. Execute schema.sql in a disposable Supabase project.
2. Populate master records; create draft receipt with item_id and warehouse_id; call `select erp_post_receipt('UUID');`.
3. Create draft sorting run and output rows with item_id, warehouse_id and output quantities; call `select erp_post_sorting_run('UUID');`.
4. Reserve: `select erp_reserve_stock('LOT UUID','reference',100,'notes');`; release: `select erp_release_reservation('RESERVATION UUID');`.

SECURITY: functions are SECURITY DEFINER. Script intentionally does not grant execution. Harden ownership/search_path, revoke PUBLIC execute and grant to authorized roles, implement RLS, and review in staging before production. This is not executed or runtime-tested yet.
