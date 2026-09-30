---
"cf": patch
---

Resolve zone names beyond the first page of an account

Filter zone lookups by domain name so `--zone` and `CLOUDFLARE_ZONE_ID` can
resolve zones in accounts with more than one page of zones. Cache each name
separately within its account.
