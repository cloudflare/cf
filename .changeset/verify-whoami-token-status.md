---
"cf": patch
---

Fix scoped API token validity reporting in `cf auth whoami`

Check the token verification status so restricted user and account detail
endpoints do not make an active token appear invalid. Report unknown validity
when none of the available checks can establish the token's status.
