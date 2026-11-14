---
"cf": patch
---

Preserve body account fields independently of path account context

Restore the required `--excluded-account-id` flag for `cf resource-sharing excluded-recipients create`. Keep the owning account in the URL and send the excluded account as the JSON `account_id`, including in dry-run previews. Honor schema names for body account fields independently of their path names.

Also restore `--account-id-body` on `cf cloudforce-one threat-intel datasets access groups members create`, `cf cloudforce-one threat-intel events create`, and `cf intel indicator-feeds providers create`. The Intel provider command requires this field: pass `--account-id-body` or include `account_id` in `--body`.
