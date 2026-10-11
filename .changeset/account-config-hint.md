---
"cf": patch
---

Format the account-selection config hint consistently

After you pick an account, the tip for making it the project's default now
joins the prompt's guide, wraps to the terminal width, and keeps its snippet
free of guide characters so it copies cleanly. When the project already has a
`cloudflare.config.ts`, the tip names that file and shows only the `accountId`
line to add. `--quiet` now omits the tip.
