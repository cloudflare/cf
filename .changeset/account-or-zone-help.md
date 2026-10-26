---
"cf": patch
---

Explain how account-or-zone commands pick their scope

Commands that serve either an account or a zone, such as `cf rulesets list`
and `cf load-balancers account list`, now say in `--help` that they run
against your account unless you pass `--zone`, and that they ignore
`CLOUDFLARE_ZONE_ID`.
