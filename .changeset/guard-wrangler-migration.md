---
"cf": patch
---

Stop project setup when Wrangler migration does not run

Commands such as `cf deploy`, `cf build`, and `cf dev` no longer fall back to framework setup when a Wrangler config is present but migration is declined, cannot be prompted for, or needs an explicit config path. This prevents static setup from dropping a Worker's entrypoint and bindings. Run `cf migrate` explicitly before trying again, or continue using Wrangler.
