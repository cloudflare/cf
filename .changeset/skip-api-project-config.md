---
"cf": patch
---

Skip reading the compliance region from the config file when it is set in the environment

Resolve `CLOUDFLARE_COMPLIANCE_REGION` before project settings, matching the existing account ID priority. Commands with both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_COMPLIANCE_REGION` no longer evaluate a `cloudflare.config.ts` file solely to establish API context.
