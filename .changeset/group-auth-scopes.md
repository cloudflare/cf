---
"cf": minor
---

Group OAuth scopes by product

`cf auth login` now summarizes granted scopes by product, and `cf auth whoami --product [search]` and `--filter <term>` list them grouped by product area with write access highlighted and non-default scopes marked as custom. `cf auth whoami` keeps its JSON output, including the raw scope list.
