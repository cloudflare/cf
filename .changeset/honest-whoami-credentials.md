---
"cf": patch
---

Report scopes and expiry for the active whoami credentials

Omit stored OAuth scopes and expiry when an environment API token supplies the active credentials. Read OAuth metadata after refreshing the token so whoami reports the current grant.
