---
"cf": minor
---

Rank the right command first for common `cf cli search` queries

Generated commands can now carry search keywords, kept next to the search command because their metadata has no sidecar. Keywords cover the phrasings agents use most for Worker secrets (including Wrangler's `secret put` wording), listing Worker scripts, reading Worker settings, listing accounts and D1 databases, creating a D1 database, reading the Zero Trust organization and querying Workers Logs. `cf deploy` and `cf workers versions create` gain a "secrets file" keyword.
