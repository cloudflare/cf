---
"cf": minor
---

Group OAuth scopes by product

`cf auth login` now summarizes granted scopes instead of hinting at the full list, and the new `cf auth scopes` command shows them in the product categories of Cloudflare's OAuth scope catalogue, which it caches for a day. Scopes the catalogue does not categorize are listed under Uncategorized. Pass a product name, `--all`, or `--filter <term>` to list the permissions, with non-read access highlighted and non-default scopes marked as custom. `cf auth whoami` is unchanged.
