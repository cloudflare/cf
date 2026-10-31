---
"cf": minor
---

Rank `cf deploy` first for static site and Pages deploy searches

`cf cli search` now leaves out commands hidden from help, and hand-written commands can add search keywords or be excluded from results through their metadata. `cf deploy` gains keywords for static sites, Pages projects, and full-stack applications, and its description now says it deploys all three. The advisory `cf pages deploy` command, which only points to `cf deploy`, no longer appears in search results.
