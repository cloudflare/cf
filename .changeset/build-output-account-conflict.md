---
"cf": minor
---

Reject a `CLOUDFLARE_ACCOUNT_ID` that differs from the Build Output's account

`cf deploy`, `cf workers versions create`, `cf workers triggers deploy`, and `cf previews deploy` now fail before making any API requests, including with `--dry-run`, when `CLOUDFLARE_ACCOUNT_ID` is set to a different account from the `accountId` recorded in the Build Output. Previously the recorded account was used and `CLOUDFLARE_ACCOUNT_ID` was silently ignored, so a deploy could go to a different account from the one the environment named.

This is a breaking change for projects that set both to different values. The error says where `CLOUDFLARE_ACCOUNT_ID` came from, such as `.env.staging`, and how to resolve it: remove `CLOUDFLARE_ACCOUNT_ID` to deploy to the recorded account, or remove or change `accountId` and rebuild.

A `CLOUDFLARE_COMPLIANCE_REGION` that differs from the recorded `complianceRegion` was already rejected. Its error now uses the same `cloudflare.config.ts` names and also says where the value came from. An invalid `CLOUDFLARE_COMPLIANCE_REGION` now gets the same error as other commands, and that error now names the dotenv file the value came from.
