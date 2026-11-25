# ERP Architecture

## Taxonomy
Assortment Group -> Family -> Item/Product -> Lot/Batch -> Movement.

Examples:
- Natural Rubber / Rubber Sheets / RSS 4 / Lot
- Natural Rubber / Rubber Scrap / Good Lot / Lot

## Ledger principle
Inventory quantity is never edited as a standalone balance. Receipts, sorting transformations, transfers, reservations, releases, dispatches, and adjustments are represented as auditable movements. Current stock is derived from ledger entries.

## Initial workflow
Supplier & purchase entry -> weighment -> receipt -> sorting/quality classification -> child lots or classification movements -> stock availability -> buyer order -> reservation -> dispatch -> settlement.

## Data model guidelines
- Keep product taxonomy separate from physical lot records.
- Record quantity in a consistent base unit (kg for rubber); preserve original unit and weighment values when relevant.
- Track source purchase and transformation lineage.
- Distinguish physical, reserved and in-transit inventory.
- Use append-only ledger records and reversal/correction entries.
- Include audit metadata and access controls.
