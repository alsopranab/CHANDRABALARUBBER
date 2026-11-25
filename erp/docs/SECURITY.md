# ERP Security baseline

Migration `database/security.sql` enables RLS across ERP tables and defines role-based access (admin/manager/staff/viewer) via `erp_user_roles`. Master data mutation is admin-only; transaction tables currently have read-only policies, with writes intended through carefully permissioned RPCs.

## Setup notes
- First create your auth users and assign role rows using an owner-level trusted SQL workflow.
- Test with separate role accounts in staging.
- This security migration is a starting point, not a certified security design. Review helper-function ownership, policy recursion, grants and RPC authorization.
- RPCs are revoked from PUBLIC. A trusted deployment should grant only to appropriate roles after testing.
