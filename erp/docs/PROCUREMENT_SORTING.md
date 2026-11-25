# Procurement and sorting prototype

- Procurement page: demo receipt capture; net weight = gross minus tare; estimates value from net x rate.
- Sorting page: simulate grade allocation, yield percentage, and loss/unallocated amount.
- These are local-only prototypes; they do not persist, post stock movements, or generate child lot IDs.

Production requirements: master supplier lookup, weighment validation, receipt numbering, posting state transitions, transaction-safe movement creation, lot genealogy, roles, audit log, and RLS.