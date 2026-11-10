---
"cf": minor
---

Stop persisting account selections between invocations

If the active credentials can access one account, select it automatically. If they can access multiple accounts and neither `cloudflare.config.ts` nor `CLOUDFLARE_ACCOUNT_ID` chooses one, ask again the next time cf starts while reusing the selection within the current invocation.
