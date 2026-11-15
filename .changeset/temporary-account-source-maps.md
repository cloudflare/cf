---
"cf": minor
---

Skip source maps when uploading to a temporary account

`cf deploy`, `cf workers versions create`, and `cf previews deploy` no longer upload source maps with `--temporary-account`. Source maps can be larger than the code they map, so they push a Worker towards the upload size limit, and their stack traces are rarely needed before the account is claimed. Deploy again after claiming the account to upload them.
